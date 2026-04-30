import httpx
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
from app.core.supabase_client import supabase_admin
from app.schemas.news import NewsCreate
from datetime import datetime
import xml.etree.ElementTree as ET
import logging
import os
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class NewsService:
    # 뉴스/기사 RSS 소스
    NEWS_SOURCES = [
        {"name": "TechCrunch", "url": "https://techcrunch.com/feed/", "type": "rss", "lang": "en"},
        {"name": "HackerNews", "url": "https://news.ycombinator.com/rss", "type": "rss", "lang": "en"},
        {"name": "Google IT News KR", "url": "https://news.google.com/rss/search?q=IT+기술+AI&hl=ko&gl=KR&ceid=KR:ko", "type": "rss", "lang": "ko"},
        {"name": "Google AI News KR", "url": "https://news.google.com/rss/search?q=인공지능+개발자&hl=ko&gl=KR&ceid=KR:ko", "type": "rss", "lang": "ko"},
        {"name": "Google Tech News KR", "url": "https://news.google.com/rss/search?q=클라우드+보안+데이터&hl=ko&gl=KR&ceid=KR:ko", "type": "rss", "lang": "ko"},
        {"name": "The Verge", "url": "https://www.theverge.com/rss/index.xml", "type": "rss", "lang": "en"},
        {"name": "Dev.to", "url": "https://dev.to/feed", "type": "rss", "lang": "en"},
    ]

    # arXiv 논문 RSS 소스
    PAPER_SOURCES = [
        {"name": "arXiv AI", "url": "https://arxiv.org/rss/cs.AI", "type": "rss", "lang": "en"},
        {"name": "arXiv ML", "url": "https://arxiv.org/rss/cs.LG", "type": "rss", "lang": "en"},
        {"name": "arXiv CV", "url": "https://arxiv.org/rss/cs.CV", "type": "rss", "lang": "en"},
        {"name": "arXiv CL", "url": "https://arxiv.org/rss/cs.CL", "type": "rss", "lang": "en"},
    ]

    # 서비스/도구 소식 RSS 소스
    SERVICE_SOURCES = [
        {"name": "Product Hunt", "url": "https://www.producthunt.com/feed", "type": "rss", "lang": "en"},
        {"name": "GitHub Blog", "url": "https://github.blog/feed/", "type": "rss", "lang": "en"},
        {"name": "AWS Blog", "url": "https://aws.amazon.com/blogs/aws/feed/", "type": "rss", "lang": "en"},
    ]

    CATEGORY_KEYWORDS = {
        "AI/ML": [
            "ai", "ml", "artificial intelligence", "machine learning", "deep learning",
            "openai", "gpt", "llm", "gemini", "claude", "anthropic", "transformer",
            "neural network", "diffusion", "stable diffusion", "midjourney",
            "인공지능", "딥러닝", "머신러닝", "생성형", "거대언어모델", "챗봇"
        ],
        "Development": [
            "coding", "software", "developer", "framework", "react", "nextjs", "vue", "svelte",
            "python", "java", "typescript", "javascript", "rust", "golang", "api",
            "github", "open source", "npm", "package", "library",
            "개발", "코딩", "프레임워크", "오픈소스", "라이브러리", "프로그래밍"
        ],
        "Cloud/Infra": [
            "aws", "azure", "google cloud", "gcp", "kubernetes", "k8s", "docker",
            "server", "infra", "cloud", "devops", "terraform", "ansible", "ci/cd",
            "microservice", "container", "serverless",
            "클라우드", "서버", "인프라", "데브옵스", "컨테이너"
        ],
        "Security": [
            "security", "hacking", "vulnerability", "malware", "cyber", "firewall",
            "encryption", "breach", "ransomware", "phishing", "zero-day",
            "보안", "해킹", "취약점", "악성코드", "사이버"
        ],
        "Data": [
            "data", "database", "sql", "nosql", "big data", "analytics", "spark",
            "hadoop", "etl", "data warehouse", "bi", "visualization",
            "데이터", "데이터베이스", "분석", "빅데이터", "시각화"
        ],
        "Business": [
            "startup", "funding", "acquisition", "ipo", "market", "economy",
            "investment", "unicorn", "valuation", "revenue",
            "비즈니스", "스타트업", "투자", "창업", "인수", "상장"
        ],
    }

    @staticmethod
    def classify_category(title: str, summary: str) -> str:
        text = (title + " " + summary).lower()
        scores: Dict[str, int] = {}
        for category, keywords in NewsService.CATEGORY_KEYWORDS.items():
            score = sum(1 for kw in keywords if kw in text)
            if score > 0:
                scores[category] = score
        if scores:
            return max(scores, key=scores.get)
        return "General"

    @classmethod
    async def _fetch_rss(cls, sources: List[Dict], limit_per_source: int = 10) -> List[Dict]:
        """RSS 소스에서 항목 수집"""
        all_items = []
        async with httpx.AsyncClient(
            timeout=15.0,
            headers={"User-Agent": "ITLevelUP-NewsBot/1.0"},
            follow_redirects=True
        ) as client:
            for source in sources:
                try:
                    logger.info(f"Fetching from {source['name']}: {source['url']}")
                    response = await client.get(source["url"])
                    if response.status_code != 200:
                        logger.warning(f"HTTP {response.status_code} from {source['name']}")
                        continue

                    # XML 파싱 (Atom 형식도 지원)
                    try:
                        root = ET.fromstring(response.content)
                    except ET.ParseError as e:
                        logger.error(f"XML parse error from {source['name']}: {e}")
                        continue

                    # RSS 2.0
                    items = root.findall(".//item")
                    # Atom feed
                    if not items:
                        ns = {"atom": "http://www.w3.org/2005/Atom"}
                        items = root.findall(".//atom:entry", ns) or root.findall(".//entry")

                    for item in items[:limit_per_source]:
                        title_el = item.find("title")
                        title = title_el.text if title_el is not None else ""
                        if not title:
                            continue

                        # URL
                        link_el = item.find("link")
                        if link_el is not None:
                            url = link_el.text or link_el.get("href", "")
                        else:
                            url = ""
                        if not url:
                            continue

                        # Summary / Description
                        desc_el = item.find("description") or item.find("summary") or item.find("{http://www.w3.org/2005/Atom}summary")
                        desc_text = desc_el.text if desc_el is not None else ""
                        summary = BeautifulSoup(desc_text or "", "html.parser").get_text()[:300].strip()
                        if not summary:
                            summary = title

                        all_items.append({
                            "title": title.strip(),
                            "url": url.strip(),
                            "summary": summary,
                            "source": source["name"],
                        })

                except Exception as e:
                    logger.error(f"Error fetching {source['name']}: {e}")
                    continue

        return all_items

    @classmethod
    async def fetch_tech_news(cls) -> List[NewsCreate]:
        """뉴스/기사 수집"""
        items = await cls._fetch_rss(cls.NEWS_SOURCES, limit_per_source=15)
        result = []
        for item in items:
            category = cls.classify_category(item["title"], item["summary"])
            result.append(NewsCreate(
                title=item["title"],
                url=item["url"],
                summary=item["summary"],
                source=item["source"],
                category=category,
                content_type="News",
                published_at=datetime.now()
            ))
        return result

    @classmethod
    async def fetch_papers(cls) -> List[NewsCreate]:
        """논문 수집 (arXiv)"""
        items = await cls._fetch_rss(cls.PAPER_SOURCES, limit_per_source=10)
        result = []
        for item in items:
            # 논문은 제목/요약으로 카테고리 분류하되 기본은 AI/ML
            category = cls.classify_category(item["title"], item["summary"])
            if category == "General":
                category = "AI/ML"
                
            result.append(NewsCreate(
                title=item["title"],
                url=item["url"],
                summary=item["summary"],
                source=item["source"],
                category=category,
                content_type="Paper",
                published_at=datetime.now()
            ))
        return result

    @classmethod
    async def fetch_service_news(cls) -> List[NewsCreate]:
        """서비스/도구 소식 수집"""
        items = await cls._fetch_rss(cls.SERVICE_SOURCES, limit_per_source=10)
        result = []
        for item in items:
            category = cls.classify_category(item["title"], item["summary"])
            result.append(NewsCreate(
                title=item["title"],
                url=item["url"],
                summary=item["summary"],
                source=item["source"],
                category=category,
                content_type="Service",
                published_at=datetime.now()
            ))
        return result

    @staticmethod
    async def translate_text(text: str, target_lang: str = "Korean") -> str:
        """OpenAI를 사용하여 텍스트 번역"""
        if not text:
            return ""
        try:
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": f"You are a professional translator. Translate the following text to {target_lang}. Keep technical terms if appropriate."},
                    {"role": "user", "content": text}
                ],
                max_tokens=500,
                temperature=0.3
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Translation error: {e}")
            return text

    @staticmethod
    async def validate_content_with_ai(items: List[NewsCreate]) -> List[NewsCreate]:
        """OpenAI를 사용하여 뉴스 항목의 IT/AI 관련성 및 정확도 검증"""
        if not items:
            return []
        
        logger.info(f"Starting AI validation for {len(items)} items...")
        validated_items = []
        batch_size = 15 # 4o-mini는 저렴하고 빠르므로 조금 더 큰 배치 사용 가능
        
        for i in range(0, len(items), batch_size):
            batch = items[i:i+batch_size]
            items_text = ""
            for idx, item in enumerate(batch):
                # 요약문이 너무 길면 자름
                summary = item.summary[:200] if item.summary else ""
                items_text += f"[{idx}] Title: {item.title}\nSummary: {summary}\n\n"
            
            prompt = f"""
            You are an expert IT news curator. Your task is to filter out news items that are NOT relevant to IT, AI, software development, cloud infrastructure, security, or tech business.
            Also filter out items that are:
            - Pure advertisements or marketing spam
            - Broken text or nonsensical content
            - Very old or outdated information
            
            Evaluate the following items and return ONLY the indices of the items that are high-quality and relevant.
            Format: [0, 2, 3] (return only the JSON-like list of numbers)
            
            Items:
            {items_text}
            """
            
            try:
                response = await client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=150,
                    temperature=0.1
                )
                content = response.choices[0].message.content.strip()
                # 인덱스 추출 (정규식 사용)
                import re
                matches = re.findall(r'\d+', content)
                indices = [int(idx) for idx in matches]
                
                for idx in indices:
                    if 0 <= idx < len(batch):
                        validated_items.append(batch[idx])
                
                logger.info(f"Batch {i//batch_size + 1} validated: {len(indices)}/{len(batch)} items passed.")
            except Exception as e:
                logger.error(f"AI validation error in batch: {e}")
                # 에러 발생 시 안정성을 위해 해당 배치는 통과시킴
                validated_items.extend(batch)
                
        logger.info(f"AI validation complete: {len(validated_items)}/{len(items)} items passed.")
        return validated_items

    @classmethod
    async def fetch_all(cls) -> Dict[str, int]:
        """뉴스 + 논문 + 서비스 소식 모두 수집 후 저장"""
        news = await cls.fetch_tech_news()
        papers = await cls.fetch_papers()
        services = await cls.fetch_service_news()

        all_items = news + papers + services
        
        # AI 검증 수행
        validated_items = await cls.validate_content_with_ai(all_items)
        
        saved = await cls.save_news_to_db(validated_items)
        return {
            "news": len(news),
            "papers": len(papers),
            "services": len(services),
            "total_fetched": len(all_items),
            "total_validated": len(validated_items),
            "saved": saved,
        }

    @staticmethod
    async def save_news_to_db(news_list: List[NewsCreate]) -> int:
        """DB에 저장 (중복 URL 스킵) - service role 사용"""
        saved_count = 0
        for news in news_list:
            try:
                existing = supabase_admin.table("news").select("id").eq("url", news.url).execute()
                if not existing.data:
                    data = {
                        "title": news.title,
                        "url": news.url,
                        "summary": news.summary,
                        "source": news.source,
                        "category": news.category,
                        "published_at": news.published_at.isoformat() if news.published_at else None,
                    }
                    
                    # content_type 컬럼이 있는지 시도해보고, 없으면 제외하고 저장
                    try:
                        data["content_type"] = news.content_type
                        supabase_admin.table("news").insert(data).execute()
                    except Exception as e:
                        if "content_type" in str(e).lower() or "PGRST204" in str(e):
                            del data["content_type"]
                            supabase_admin.table("news").insert(data).execute()
                        else:
                            raise e
                    
                    saved_count += 1
            except Exception as e:
                logger.error(f"Error saving news [{news.url[:60]}]: {e}")

        return saved_count

    @staticmethod
    async def get_stored_news(
        category: Optional[str] = None,
        content_type: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[Dict]:
        """DB에서 뉴스 조회 (컬럼 부재 시 Python 필터링 전략 사용)"""
        try:
            # 1단계: 기본 쿼리 생성
            query = supabase_admin.table("news").select("*").order("created_at", desc=True)
            if category and category not in ("All", "전체"):
                query = query.eq("category", category)
            
            # 2단계: content_type 컬럼이 있는 것으로 가정하고 시도
            try:
                if content_type and content_type not in ("All", "전체", "all"):
                    temp_query = query.eq("content_type", content_type)
                    response = temp_query.range(offset, offset + limit - 1).execute()
                else:
                    response = query.range(offset, offset + limit - 1).execute()
                return response.data or []
            except Exception as e:
                # 3단계: content_type 컬럼이 없어 실패한 경우, 전체를 가져와서 Python에서 필터링
                if "content_type" in str(e).lower() or "42703" in str(e):
                    logger.warning("content_type column missing, falling back to Python filtering")
                    # 한꺼번에 많이 가져와서 필터링 (페이지네이션 제약이 생김)
                    response = query.range(0, 100).execute()
                    all_data = response.data or []
                    
                    if content_type and content_type not in ("All", "전체", "all"):
                        # 수동 매핑 (기존 소스명을 기준으로 추측)
                        from app.services.news_service import NewsService
                        filtered = []
                        for item in all_data:
                            item_type = "News"
                            if any(s["name"] in item["source"] for s in NewsService.PAPER_SOURCES):
                                item_type = "Paper"
                            elif any(s["name"] in item["source"] for s in NewsService.SERVICE_SOURCES):
                                item_type = "Service"
                            
                            if item_type.lower() == content_type.lower():
                                filtered.append(item)
                        return filtered[offset:offset + limit]
                    return all_data[offset:offset + limit]
                raise e
        except Exception as e:
            logger.error(f"Error fetching news from DB: {e}")
            return []

    @staticmethod
    async def get_news_stats() -> Dict:
        """카테고리별 뉴스 통계"""
        try:
            response = supabase_admin.table("news").select("category").execute()
            data = response.data or []
            stats: Dict[str, int] = {}
            for row in data:
                cat = row.get("category", "General")
                stats[cat] = stats.get(cat, 0) + 1
            return {"total": len(data), "by_category": stats}
        except Exception as e:
            logger.error(f"Error fetching stats: {e}")
            return {"total": 0, "by_category": {}}
