from fastapi import APIRouter, HTTPException, Query
from app.services.news_service import NewsService
from typing import List, Optional

router = APIRouter()


@router.get("/", response_model=List[dict])
async def get_news(
    category: Optional[str] = Query(None, description="기술 카테고리 필터 (AI/ML, Development, Cloud/Infra, Security, Data, Business)"),
    content_type: Optional[str] = Query(None, description="콘텐츠 타입 필터 (News, Paper, Service)"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """DB에서 뉴스 조회 (카테고리/타입 필터 가능)"""
    news = await NewsService.get_stored_news(
        category=category,
        content_type=content_type,
        limit=limit,
        offset=offset,
    )
    return news


@router.post("/fetch")
async def fetch_news():
    """뉴스 + 논문 + 서비스 소식 모두 수집 후 DB 저장"""
    try:
        result = await NewsService.fetch_all()
        return {
            "message": f"수집 완료: 총 {result['total_fetched']}건 중 {result['saved']}건 새로 저장",
            "detail": result,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_news_stats():
    """카테고리별 뉴스 통계"""
    return await NewsService.get_news_stats()


@router.post("/translate")
async def translate_news(data: dict):
    """뉴스 제목/요약 번역"""
    text = data.get("text")
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")
    
    translated = await NewsService.translate_text(text)
    return {"translated_text": translated}
