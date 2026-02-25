"""add gamification layer season 1

Revision ID: e6c9a91b2d31
Revises: 7a6c2d9f1b44
Create Date: 2026-02-25 04:35:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "e6c9a91b2d31"
down_revision: Union[str, Sequence[str], None] = "7a6c2d9f1b44"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


achievement_rarity = sa.Enum("common", "uncommon", "rare", "epic", "legendary", name="achievementrarity")
quest_type = sa.Enum("micro_reflection", "one_decision_sim", "skill_flash", "pivot_check", name="questtype")


def upgrade() -> None:
    op.create_table(
        "universities",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("short_code", sa.String(length=32), nullable=False),
        sa.Column("region", sa.String(length=120), nullable=True),
        sa.Column("logo_url", sa.String(length=500), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_universities_name"), "universities", ["name"], unique=True)
    op.create_index(op.f("ix_universities_short_code"), "universities", ["short_code"], unique=True)

    op.add_column("users", sa.Column("xp_multiplier", sa.Float(), nullable=False, server_default=sa.text("1.0")))
    op.add_column("users", sa.Column("xp_multiplier_until", sa.DateTime(timezone=True), nullable=True))
    op.add_column("users", sa.Column("timezone", sa.String(length=64), nullable=False, server_default=sa.text("'UTC'")))
    op.add_column("users", sa.Column("sound_enabled", sa.Boolean(), nullable=False, server_default=sa.text("true")))
    op.add_column("users", sa.Column("elite_chat_access", sa.Boolean(), nullable=False, server_default=sa.text("false")))
    op.add_column("users", sa.Column("university_id", sa.UUID(), nullable=True))
    op.create_index(op.f("ix_users_university_id"), "users", ["university_id"], unique=False)
    op.create_foreign_key(
        "fk_users_university_id_universities",
        "users",
        "universities",
        ["university_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.create_table(
        "gamification_levels",
        sa.Column("level", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=120), nullable=False),
        sa.Column("xp_min", sa.Integer(), nullable=False),
        sa.Column("xp_max", sa.Integer(), nullable=True),
        sa.Column("ui_upgrade", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("level"),
    )
    op.create_index(op.f("ix_gamification_levels_xp_min"), "gamification_levels", ["xp_min"], unique=False)

    op.create_table(
        "achievements",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("key", sa.String(length=80), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("rarity", achievement_rarity, nullable=False),
        sa.Column("condition_type", sa.String(length=120), nullable=False),
        sa.Column("condition_payload", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("reward_payload", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("season", sa.Integer(), nullable=False, server_default=sa.text("1")),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_achievements_key"), "achievements", ["key"], unique=True)

    op.create_table(
        "user_achievements",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("achievement_id", sa.UUID(), nullable=False),
        sa.Column("unlocked_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("unlock_metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.ForeignKeyConstraint(["achievement_id"], ["achievements.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "achievement_id", name="uq_user_achievement_unique"),
    )
    op.create_index(op.f("ix_user_achievements_achievement_id"), "user_achievements", ["achievement_id"], unique=False)
    op.create_index(op.f("ix_user_achievements_user_id"), "user_achievements", ["user_id"], unique=False)

    op.create_table(
        "daily_quests",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("quest_date", sa.Date(), nullable=False),
        sa.Column("quest_type", quest_type, nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("prompt", sa.Text(), nullable=False),
        sa.Column("payload", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("xp_reward", sa.Integer(), nullable=False, server_default=sa.text("25")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("quest_date"),
    )
    op.create_index(op.f("ix_daily_quests_quest_date"), "daily_quests", ["quest_date"], unique=True)

    op.create_table(
        "user_daily_quests",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("quest_id", sa.UUID(), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["quest_id"], ["daily_quests.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "quest_id", name="uq_user_daily_quest_unique"),
    )
    op.create_index(op.f("ix_user_daily_quests_quest_id"), "user_daily_quests", ["quest_id"], unique=False)
    op.create_index(op.f("ix_user_daily_quests_user_id"), "user_daily_quests", ["user_id"], unique=False)

    op.create_table(
        "user_streaks",
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("current_streak", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("longest_streak", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("last_completed_date", sa.Date(), nullable=True),
        sa.Column("shield_count", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("last_shield_earned_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("user_id"),
    )

    op.create_table(
        "leaderboard_weekly_snapshots",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("week_start", sa.Date(), nullable=False),
        sa.Column("week_end", sa.Date(), nullable=False),
        sa.Column("university_id", sa.UUID(), nullable=False),
        sa.Column("score", sa.Float(), nullable=False, server_default=sa.text("0")),
        sa.Column("rank", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("delta", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["university_id"], ["universities.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("week_start", "university_id", name="uq_weekly_leaderboard_university"),
    )
    op.create_index(
        op.f("ix_leaderboard_weekly_snapshots_university_id"),
        "leaderboard_weekly_snapshots",
        ["university_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_leaderboard_weekly_snapshots_week_start"),
        "leaderboard_weekly_snapshots",
        ["week_start"],
        unique=False,
    )

    op.create_table(
        "leaderboard_student_contributions",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("snapshot_id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("university_id", sa.UUID(), nullable=False),
        sa.Column("weekly_xp", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("achievement_points", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("streak_points", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("simulation_mastery_points", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("total_score", sa.Float(), nullable=False, server_default=sa.text("0")),
        sa.Column("rank", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["snapshot_id"], ["leaderboard_weekly_snapshots.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["university_id"], ["universities.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("snapshot_id", "user_id", name="uq_snapshot_user_contribution"),
    )
    op.create_index(
        op.f("ix_leaderboard_student_contributions_snapshot_id"),
        "leaderboard_student_contributions",
        ["snapshot_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_leaderboard_student_contributions_university_id"),
        "leaderboard_student_contributions",
        ["university_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_leaderboard_student_contributions_user_id"),
        "leaderboard_student_contributions",
        ["user_id"],
        unique=False,
    )

    op.create_table(
        "gamification_notifications",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("type", sa.String(length=80), nullable=False),
        sa.Column("payload", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_gamification_notifications_created_at"),
        "gamification_notifications",
        ["created_at"],
        unique=False,
    )
    op.create_index(op.f("ix_gamification_notifications_type"), "gamification_notifications", ["type"], unique=False)
    op.create_index(op.f("ix_gamification_notifications_user_id"), "gamification_notifications", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_gamification_notifications_user_id"), table_name="gamification_notifications")
    op.drop_index(op.f("ix_gamification_notifications_type"), table_name="gamification_notifications")
    op.drop_index(op.f("ix_gamification_notifications_created_at"), table_name="gamification_notifications")
    op.drop_table("gamification_notifications")

    op.drop_index(op.f("ix_leaderboard_student_contributions_user_id"), table_name="leaderboard_student_contributions")
    op.drop_index(
        op.f("ix_leaderboard_student_contributions_university_id"),
        table_name="leaderboard_student_contributions",
    )
    op.drop_index(
        op.f("ix_leaderboard_student_contributions_snapshot_id"),
        table_name="leaderboard_student_contributions",
    )
    op.drop_table("leaderboard_student_contributions")

    op.drop_index(op.f("ix_leaderboard_weekly_snapshots_week_start"), table_name="leaderboard_weekly_snapshots")
    op.drop_index(
        op.f("ix_leaderboard_weekly_snapshots_university_id"),
        table_name="leaderboard_weekly_snapshots",
    )
    op.drop_table("leaderboard_weekly_snapshots")

    op.drop_table("user_streaks")

    op.drop_index(op.f("ix_user_daily_quests_user_id"), table_name="user_daily_quests")
    op.drop_index(op.f("ix_user_daily_quests_quest_id"), table_name="user_daily_quests")
    op.drop_table("user_daily_quests")

    op.drop_index(op.f("ix_daily_quests_quest_date"), table_name="daily_quests")
    op.drop_table("daily_quests")

    op.drop_index(op.f("ix_user_achievements_user_id"), table_name="user_achievements")
    op.drop_index(op.f("ix_user_achievements_achievement_id"), table_name="user_achievements")
    op.drop_table("user_achievements")

    op.drop_index(op.f("ix_achievements_key"), table_name="achievements")
    op.drop_table("achievements")

    op.drop_index(op.f("ix_gamification_levels_xp_min"), table_name="gamification_levels")
    op.drop_table("gamification_levels")

    op.drop_constraint("fk_users_university_id_universities", "users", type_="foreignkey")
    op.drop_index(op.f("ix_users_university_id"), table_name="users")
    op.drop_column("users", "university_id")
    op.drop_column("users", "elite_chat_access")
    op.drop_column("users", "sound_enabled")
    op.drop_column("users", "timezone")
    op.drop_column("users", "xp_multiplier_until")
    op.drop_column("users", "xp_multiplier")

    op.drop_index(op.f("ix_universities_short_code"), table_name="universities")
    op.drop_index(op.f("ix_universities_name"), table_name="universities")
    op.drop_table("universities")

    op.execute("DROP TYPE IF EXISTS questtype")
    op.execute("DROP TYPE IF EXISTS achievementrarity")
