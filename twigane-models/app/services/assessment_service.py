from app.models.assessment_models import Assessment, AssessmentResult
from app.core.database import Database
from fastapi import HTTPException
from datetime import datetime
from typing import List
from bson import ObjectId

class AssessmentService:
    def __init__(self):
        self.db = Database.get_db()

    async def create_assessment(self, assessment_data: dict) -> Assessment:
        assessment_data["created_at"] = datetime.utcnow()
        assessment_data["updated_at"] = datetime.utcnow()
        
        result = await self.db.assessments.insert_one(assessment_data)
        assessment_data["id"] = str(result.inserted_id)
        return Assessment(**assessment_data)

    async def get_assessment(self, assessment_id: str) -> Assessment:
        assessment = await self.db.assessments.find_one({"_id": ObjectId(assessment_id)})
        if not assessment:
            raise HTTPException(status_code=404, detail="Assessment not found")
        assessment["id"] = str(assessment["_id"])
        return Assessment(**assessment)

    async def submit_assessment(self, user_id: str, assessment_id: str, submission: dict) -> AssessmentResult:
        assessment = await self.get_assessment(assessment_id)
        score = await self._calculate_score(assessment, submission["answers"])
        
        result_data = {
            "user_id": user_id,
            "assessment_id": assessment_id,
            "score": score,
            "time_taken": submission["time_taken"],
            "answers": submission["answers"],
            "completed_at": datetime.utcnow(),
            "mastery_level": self._determine_mastery_level(score)
        }
        
        result = await self.db.assessment_results.insert_one(result_data)
        result_data["id"] = str(result.inserted_id)
        
        # Update user progress
        await self._update_user_progress(user_id, assessment_id, score)
        
        return AssessmentResult(**result_data)

    async def _calculate_score(self, assessment: Assessment, answers: List[dict]) -> float:
        total_questions = len(assessment.questions)
        correct_answers = 0
        
        for q, a in zip(assessment.questions, answers):
            if a["answer"] == q["correct_answer"]:
                correct_answers += 1
        
        return (correct_answers / total_questions) * 100

    def _determine_mastery_level(self, score: float) -> str:
        if score >= 90:
            return "expert"
        elif score >= 75:
            return "proficient"
        elif score >= 60:
            return "developing"
        else:
            return "beginner"

    async def _update_user_progress(self, user_id: str, assessment_id: str, score: float):
        # Update user's progress and unlock new content if necessary
        assessment = await self.get_assessment(assessment_id)
        update_data = {
            "last_assessment": {
                "id": assessment_id,
                "score": score,
                "completed_at": datetime.utcnow()
            }
        }
        
        if score >= assessment.passing_score:
            update_data["completed_assessments"] = assessment_id
        
        await self.db.user_progress.update_one(
            {"user_id": user_id},
            {
                "$set": update_data,
                "$push": {"assessment_history": {
                    "assessment_id": assessment_id,
                    "score": score,
                    "completed_at": datetime.utcnow()
                }}
            }
        )