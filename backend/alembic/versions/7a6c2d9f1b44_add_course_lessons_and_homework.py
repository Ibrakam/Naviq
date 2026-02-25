"""add course lessons and homework submissions

Revision ID: 7a6c2d9f1b44
Revises: 1d4c9b7d4a21
Create Date: 2026-02-24 20:55:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "7a6c2d9f1b44"
down_revision: Union[str, Sequence[str], None] = "1d4c9b7d4a21"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "course_lessons",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("course_id", sa.UUID(), nullable=False),
        sa.Column("order", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("youtube_url", sa.Text(), nullable=True),
        sa.Column("homework_prompt", sa.Text(), nullable=True),
        sa.Column("homework_rubric", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("course_id", "order", name="uq_course_lessons_course_order"),
    )

    op.create_table(
        "lesson_homework_submissions",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("lesson_id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("answer", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("score", sa.Integer(), nullable=True),
        sa.Column("feedback", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("checked_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["lesson_id"], ["course_lessons.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_lesson_homework_submissions_lesson_id"),
        "lesson_homework_submissions",
        ["lesson_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_lesson_homework_submissions_user_id"),
        "lesson_homework_submissions",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_lesson_homework_submissions_user_id"), table_name="lesson_homework_submissions")
    op.drop_index(op.f("ix_lesson_homework_submissions_lesson_id"), table_name="lesson_homework_submissions")
    op.drop_table("lesson_homework_submissions")
    op.drop_table("course_lessons")
