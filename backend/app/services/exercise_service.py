from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.exercise import Exercise
from app.schemas.exercise import ExerciseCreate

DEFAULT_EXERCISES = [
    # Cardio
    {"name": "Outdoor 5K Run", "category": "Cardio", "duration": 30, "calories_burned": 320.0, "difficulty": "Intermediate", "description": "Steady-pace continuous 5K aerobic run focusing on cadence and breathing."},
    {"name": "High-Intensity Interval Sprints", "category": "Cardio", "duration": 20, "calories_burned": 260.0, "difficulty": "Advanced", "description": "30s max effort sprint followed by 60s walking recovery, 10 rounds."},
    {"name": "Stationary Bike Cycling", "category": "Cardio", "duration": 45, "calories_burned": 380.0, "difficulty": "Beginner", "description": "Zone 2 aerobic cycling building endurance and cardiovascular base."},
    {"name": "Jump Rope HIIT Circuit", "category": "Cardio", "duration": 15, "calories_burned": 180.0, "difficulty": "Intermediate", "description": "Interval jump roping mixed with bodyweight jumping jacks and mountain climbers."},
    {"name": "Rowing Machine Intervals", "category": "Cardio", "duration": 25, "calories_burned": 250.0, "difficulty": "Intermediate", "description": "Full-body rowing intervals targeting latissimus dorsi, core, and cardiovascular endurance."},
    {"name": "Stair Climber Climb", "category": "Cardio", "duration": 30, "calories_burned": 310.0, "difficulty": "Intermediate", "description": "High-cadence steady climbing workout targeting glutes, quads, and calves."},

    # Strength
    {"name": "Barbell Back Squats & Core", "category": "Strength", "duration": 45, "calories_burned": 280.0, "difficulty": "Intermediate", "description": "Heavy compound squat sets (5x5) followed by hanging leg raises and planks."},
    {"name": "Barbell Bench Press & Dips", "category": "Strength", "duration": 40, "calories_burned": 240.0, "difficulty": "Intermediate", "description": "Upper body push focus: Flat bench press, incline dumbbell press, and weighted dips."},
    {"name": "Conventional Deadlifts", "category": "Strength", "duration": 45, "calories_burned": 320.0, "difficulty": "Advanced", "description": "Posterior chain power training targeting hamstrings, glutes, spinal erectors, and grip."},
    {"name": "Pull-ups & Dumbbell Rows", "category": "Strength", "duration": 35, "calories_burned": 220.0, "difficulty": "Intermediate", "description": "Upper body pull workout for back thickness, lat width, and bicep activation."},
    {"name": "Full-Body Dumbbell Complex", "category": "Strength", "duration": 30, "calories_burned": 250.0, "difficulty": "Beginner", "description": "Dumbbell goblet squats, shoulder presses, lunges, and bent-over rows with minimal rest."},
    {"name": "Leg Press & Romanian Deadlifts", "category": "Strength", "duration": 40, "calories_burned": 260.0, "difficulty": "Intermediate", "description": "Lower body hypertrophy workout targeting quad sweep and hamstring elasticity."},

    # Yoga
    {"name": "Sunrise Sun Salutation Flow", "category": "Yoga", "duration": 25, "calories_burned": 110.0, "difficulty": "Beginner", "description": "Gentle Surya Namaskar A & B sequences to awaken the spine and improve mobility."},
    {"name": "Vinyasa Flow for Core & Balance", "category": "Yoga", "duration": 45, "calories_burned": 190.0, "difficulty": "Intermediate", "description": "Dynamic flow emphasizing warrior poses, crow balance, and deep abdominal activation."},
    {"name": "Restorative Yin Yoga", "category": "Yoga", "duration": 40, "calories_burned": 95.0, "difficulty": "Beginner", "description": "Long-held passive floor poses releasing tension in hips, lower back, and fascia."},
    {"name": "Power Ashtanga Practice", "category": "Yoga", "duration": 50, "calories_burned": 240.0, "difficulty": "Advanced", "description": "Vigorous, synchronized breath and movement sequence building heat, strength, and endurance."},
    {"name": "Hatha Yoga for Posture & Hip Opening", "category": "Yoga", "duration": 30, "calories_burned": 130.0, "difficulty": "Beginner", "description": "Static holds focusing on hip openers, thoracic spine rotation, and stress reduction."},

    # HIIT / Functional
    {"name": "Tabata Cardio Explosion", "category": "HIIT", "duration": 20, "calories_burned": 220.0, "difficulty": "Advanced", "description": "20 seconds all-out work, 10 seconds rest, 8 sets across burpees, thrusters, and kettlebell swings."},
    {"name": "Kettlebell Swing & Clean Circuit", "category": "HIIT", "duration": 25, "calories_burned": 260.0, "difficulty": "Intermediate", "description": "Explosive hip hinge conditioning with single and double kettlebells."},
    {"name": "Core Crusher & Isometric Holds", "category": "Pilates", "duration": 20, "calories_burned": 120.0, "difficulty": "Beginner", "description": "Pilates hundred, hollow body holds, side plank rotations, and bird-dogs for deep core stability."},
]

class ExerciseService:
    @staticmethod
    def seed_default_exercises(db: Session) -> int:
        count = 0
        for item in DEFAULT_EXERCISES:
            exists = db.query(Exercise).filter(Exercise.name == item["name"]).first()
            if not exists:
                ex = Exercise(
                    name=item["name"],
                    category=item["category"],
                    duration=item["duration"],
                    calories_burned=item["calories_burned"],
                    difficulty=item["difficulty"],
                    description=item["description"],
                )
                db.add(ex)
                count += 1
        if count > 0:
            db.commit()
        return count

    @staticmethod
    def get_exercises(
        db: Session,
        category: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Exercise]:
        # Ensure default exercises are seeded
        if db.query(Exercise).count() == 0:
            ExerciseService.seed_default_exercises(db)

        query = db.query(Exercise)
        if category and category.lower() != "all":
            query = query.filter(Exercise.category.ilike(f"%{category.strip()}%"))
        if search:
            query = query.filter(
                (Exercise.name.ilike(f"%{search.strip()}%")) |
                (Exercise.description.ilike(f"%{search.strip()}%"))
            )
        return query.order_by(Exercise.category.asc(), Exercise.name.asc()).offset(offset).limit(limit).all()

    @staticmethod
    def get_exercise_by_id(db: Session, exercise_id: int) -> Exercise:
        exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
        if not exercise:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exercise not found")
        return exercise

    @staticmethod
    def create_exercise(db: Session, exercise_in: ExerciseCreate) -> Exercise:
        exercise = Exercise(
            name=exercise_in.name.strip(),
            category=exercise_in.category.strip(),
            description=exercise_in.description.strip() if exercise_in.description else None,
            duration=exercise_in.duration,
            calories_burned=exercise_in.calories_burned or 0.0,
            difficulty=exercise_in.difficulty or "Intermediate",
        )
        db.add(exercise)
        db.commit()
        db.refresh(exercise)
        return exercise
