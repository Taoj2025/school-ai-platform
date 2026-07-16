from fastapi import APIRouter

router = APIRouter(prefix="/accounts", tags=["accounts"])


@router.get("/me")
async def get_current_user():
    return {"message": "Current user endpoint"}
