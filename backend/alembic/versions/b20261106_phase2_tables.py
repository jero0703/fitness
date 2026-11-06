"""Phase 2: Advanced Tracking & User Engagement Migration

Revision ID: b20261106_phase2
Revises: aeacf7333f0b
Create Date: 2026-11-06 10:25:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'b20261106_phase2'
down_revision: Union[str, Sequence[str], None] = 'aeacf7333f0b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. workout_plans
    op.create_table(
        'workout_plans',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=150), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('scheduled_date', sa.Date(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='PLANNED'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_plan_user_date', 'workout_plans', ['user_id', 'scheduled_date'], unique=False)
    op.create_index('idx_plan_user_status', 'workout_plans', ['user_id', 'status'], unique=False)
    op.create_index(op.f('ix_workout_plans_id'), 'workout_plans', ['id'], unique=False)
    op.create_index(op.f('ix_workout_plans_user_id'), 'workout_plans', ['user_id'], unique=False)
    op.create_index(op.f('ix_workout_plans_scheduled_date'), 'workout_plans', ['scheduled_date'], unique=False)

    # 2. exercises
    op.create_table(
        'exercises',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('duration', sa.Integer(), nullable=False),
        sa.Column('calories_burned', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('difficulty', sa.String(length=50), nullable=False, server_default='Intermediate'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_exercise_category_name', 'exercises', ['category', 'name'], unique=False)
    op.create_index(op.f('ix_exercises_id'), 'exercises', ['id'], unique=False)
    op.create_index(op.f('ix_exercises_name'), 'exercises', ['name'], unique=False)
    op.create_index(op.f('ix_exercises_category'), 'exercises', ['category'], unique=False)

    # 3. streak
    op.create_table(
        'streak',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('current_streak', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('longest_streak', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('last_workout_date', sa.Date(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_streak_id'), 'streak', ['id'], unique=False)
    op.create_index(op.f('ix_streak_user_id'), 'streak', ['user_id'], unique=True)

    # 4. badges
    op.create_table(
        'badges',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.String(length=255), nullable=False),
        sa.Column('icon', sa.String(length=100), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False, server_default='Workouts'),
        sa.Column('criteria_type', sa.String(length=50), nullable=False),
        sa.Column('criteria_threshold', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_badges_id'), 'badges', ['id'], unique=False)

    # 5. user_badges
    op.create_table(
        'user_badges',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('badge_id', sa.Integer(), nullable=False),
        sa.Column('earned_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['badge_id'], ['badges.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'badge_id', name='uq_user_badge')
    )
    op.create_index('idx_user_badge_earned', 'user_badges', ['user_id', 'earned_at'], unique=False)
    op.create_index(op.f('ix_user_badges_id'), 'user_badges', ['id'], unique=False)
    op.create_index(op.f('ix_user_badges_user_id'), 'user_badges', ['user_id'], unique=False)
    op.create_index(op.f('ix_user_badges_badge_id'), 'user_badges', ['badge_id'], unique=False)

def downgrade() -> None:
    op.drop_table('user_badges')
    op.drop_table('badges')
    op.drop_table('streak')
    op.drop_table('exercises')
    op.drop_table('workout_plans')
