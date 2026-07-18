from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from ...db.session import get_db
from ..accounts.permissions import Permission, RBACDependency


class GradePermissions:
    CREATE_EXAM_SESSION = "grade:create_exam_session"
    VIEW_EXAM_SESSION = "grade:view_exam_session"
    EDIT_EXAM_SESSION = "grade:edit_exam_session"
    DELETE_EXAM_SESSION = "grade:delete_exam_session"
    IMPORT_SCORES = "grade:import_scores"
    VIEW_SCORES = "grade:view_scores"
    EDIT_SCORES = "grade:edit_scores"
    GENERATE_COMMENTS = "grade:generate_comments"
    REVIEW_COMMENTS = "grade:review_comments"
    VIEW_ALERTS = "grade:view_alerts"
    GENERATE_REPORTS = "grade:generate_reports"


def get_rbac() -> RBACDependency:
    return RBACDependency()


async def require_create_exam_session(
    rbac: RBACDependency = Depends(get_rbac),
):
    await rbac.require_permission(GradePermissions.CREATE_EXAM_SESSION)


async def require_view_exam_session(
    rbac: RBACDependency = Depends(get_rbac),
):
    await rbac.require_permission(GradePermissions.VIEW_EXAM_SESSION)


async def require_edit_exam_session(
    rbac: RBACDependency = Depends(get_rbac),
):
    await rbac.require_permission(GradePermissions.EDIT_EXAM_SESSION)


async def require_import_scores(
    rbac: RBACDependency = Depends(get_rbac),
):
    await rbac.require_permission(GradePermissions.IMPORT_SCORES)


async def require_view_scores(
    rbac: RBACDependency = Depends(get_rbac),
):
    await rbac.require_permission(GradePermissions.VIEW_SCORES)


async def require_generate_comments(
    rbac: RBACDependency = Depends(get_rbac),
):
    await rbac.require_permission(GradePermissions.GENERATE_COMMENTS)


async def require_review_comments(
    rbac: RBACDependency = Depends(get_rbac),
):
    await rbac.require_permission(GradePermissions.REVIEW_COMMENTS)


async def require_generate_reports(
    rbac: RBACDependency = Depends(get_rbac),
):
    await rbac.require_permission(GradePermissions.GENERATE_REPORTS)
