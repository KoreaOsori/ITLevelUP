from fastapi import APIRouter, HTTPException, Depends
from app.services.user_service import UserService
from typing import List, Dict

router = APIRouter()

# TODO: 실제 배포 시에는 JWT 토큰에서 user_id를 추출해야 함
# 현재는 테스트를 위해 hardcoded id 사용 가능 또는 쿼리 파라미터로 전달
DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000000"

@router.get("/profile")
async def get_profile(user_id: str = DEFAULT_USER_ID):
    """사용자 프로필 정보 조회 (Streak 포함)"""
    profile = await UserService.get_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.get("/missions")
async def get_missions(user_id: str = DEFAULT_USER_ID):
    """오늘의 미션 리스트 조회"""
    return await UserService.get_missions(user_id)

@router.post("/missions/{mission_id}/complete")
async def complete_mission(mission_id: str, user_id: str = DEFAULT_USER_ID):
    """미션 완료 처리"""
    return await UserService.complete_mission(user_id, mission_id)

@router.get("/activity")
async def get_activity(user_id: str = DEFAULT_USER_ID):
    """주간/월간 활동 데이터 (Heatmap용)"""
    # 임시 목데이터 반환 (추후 DB 통계 쿼리로 대체)
    import random
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    return [{"day": d, "value": random.randint(0, 5)} for d in days]
