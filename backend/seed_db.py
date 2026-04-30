import asyncio
from app.core.supabase_client import supabase_admin

async def seed():
    missions = [
        {"title": "오늘의 IT 뉴스 3개 읽기", "description": "최신 IT 트렌드를 파악합니다.", "xp_reward": 15, "frequency": "daily"},
        {"title": "인공지능 논문 요약 보기", "description": "AI 기술의 흐름을 이해합니다.", "xp_reward": 20, "frequency": "daily"},
        {"title": "새로운 서비스/도구 탐색", "description": "Product Hunt 등 신규 서비스를 확인합니다.", "xp_reward": 10, "frequency": "daily"},
        {"title": "포트폴리오 내용 업데이트", "description": "오늘의 학습 내용을 포트폴리오에 추가합니다.", "xp_reward": 30, "frequency": "daily"},
    ]
    for m in missions:
        try:
            existing = supabase_admin.table("missions").select("id").eq("title", m["title"]).execute()
            if not existing.data:
                supabase_admin.table("missions").insert(m).execute()
                print(f"Added: {m['title']}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(seed())
