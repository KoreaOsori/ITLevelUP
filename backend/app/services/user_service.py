from typing import List, Dict, Optional
from app.core.supabase_client import supabase_admin
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

class UserService:
    @staticmethod
    async def get_profile(user_id: str) -> Dict:
        """사용자 프로필 조회 및 연속 달성일 업데이트"""
        try:
            response = supabase_admin.table("profiles").select("*").eq("id", user_id).execute()
            if not response.data:
                # 프로필이 없으면 생성 (최초 로그인)
                new_profile = {
                    "id": user_id,
                    "name": "새로운 회원",
                    "streak": 1,
                    "last_login_at": datetime.now(timezone.utc).isoformat(),
                    "xp": 0,
                    "level": 1,
                }
                supabase_admin.table("profiles").insert(new_profile).execute()
                return new_profile
            
            profile = response.data[0]
            last_login = profile.get("last_login_at")
            
            # 연속 달성일(Streak) 계산 로직
            if last_login:
                last_date = datetime.fromisoformat(last_login.replace("Z", "+00:00")).date()
                today = datetime.now(timezone.utc).date()
                delta = (today - last_date).days
                
                if delta == 1:
                    # 하루 차이면 스트릭 유지 및 증가
                    profile["streak"] += 1
                elif delta > 1:
                    # 이틀 이상 차이면 스트릭 초기화
                    profile["streak"] = 1
                
                # 오늘 이미 로그인했다면 스트릭 유지
                profile["last_login_at"] = datetime.now(timezone.utc).isoformat()
                supabase_admin.table("profiles").update({
                    "streak": profile["streak"],
                    "last_login_at": profile["last_login_at"]
                }).eq("id", user_id).execute()
                
            return profile
        except Exception as e:
            logger.error(f"Error getting profile: {e}")
            return {}

    @staticmethod
    async def get_missions(user_id: str) -> List[Dict]:
        """오늘의 미션 및 완료 상태 조회"""
        try:
            # 1. 모든 미션 조회
            missions_res = supabase_admin.table("missions").select("*").execute()
            all_missions = missions_res.data or []
            
            # 2. 오늘 완료한 미션 조회
            today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
            completed_res = supabase_admin.table("user_missions") \
                .select("mission_id") \
                .eq("user_id", user_id) \
                .gte("completed_at", today_start) \
                .execute()
            
            completed_ids = [m["mission_id"] for m in completed_res.data]
            
            # 3. 데이터 합치기
            for mission in all_missions:
                mission["completed"] = str(mission["id"]) in [str(cid) for cid in completed_ids]
                
            return all_missions
        except Exception as e:
            logger.error(f"Error getting missions: {e}")
            return []

    @staticmethod
    async def complete_mission(user_id: str, mission_id: str) -> Dict:
        """미션 완료 처리 및 XP 보상"""
        try:
            # 중복 완료 체크
            today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
            existing = supabase_admin.table("user_missions") \
                .select("id") \
                .eq("user_id", user_id) \
                .eq("mission_id", mission_id) \
                .gte("completed_at", today_start) \
                .execute()
            
            if existing.data:
                return {"message": "Already completed today"}
            
            # 1. 완료 기록 추가
            supabase_admin.table("user_missions").insert({
                "user_id": user_id,
                "mission_id": mission_id
            }).execute()
            
            # 2. XP 보상 조회
            mission_res = supabase_admin.table("missions").select("xp_reward").eq("id", mission_id).execute()
            xp_reward = mission_res.data[0]["xp_reward"] if mission_res.data else 10
            
            # 3. 프로필 업데이트
            profile_res = supabase_admin.table("profiles").select("xp", "level").eq("id", user_id).execute()
            if profile_res.data:
                curr_xp = profile_res.data[0]["xp"] + xp_reward
                curr_level = profile_res.data[0]["level"]
                
                # 레벨업 로직 (단순화: 100 XP당 1 레벨)
                new_level = (curr_xp // 100) + 1
                
                supabase_admin.table("profiles").update({
                    "xp": curr_xp,
                    "level": new_level
                }).eq("id", user_id).execute()
                
            return {"message": "Mission completed", "xp_reward": xp_reward}
        except Exception as e:
            logger.error(f"Error completing mission: {e}")
            return {"error": str(e)}
