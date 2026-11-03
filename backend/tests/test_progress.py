from datetime import date, timedelta
from app.models.progress import Progress

def test_daily_progress_synchronization(client, auth_headers, db_session, test_user):
    today = date.today().isoformat()

    # Log workout 1
    client.post("/workouts/", headers=auth_headers, json={
        "workout_name": "Morning Run",
        "category": "Cardio",
        "duration": 30,
        "calories_burned": 250.0,
        "workout_date": today
    })
    # Log workout 2
    client.post("/workouts/", headers=auth_headers, json={
        "workout_name": "Evening Yoga",
        "category": "Yoga",
        "duration": 20,
        "calories_burned": 100.0,
        "workout_date": today
    })

    # Query daily progress endpoint
    res = client.get(f"/progress/daily?target_date={today}", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_workouts"] == 2
    assert data["total_calories"] == 350.0
    assert data["total_duration"] == 50
    assert len(data["recent_workouts"]) == 2

    # Verify no duplicate progress records exist in database for this date
    records = db_session.query(Progress).filter(
        Progress.user_id == test_user.id,
        Progress.date == date.today()
    ).all()
    assert len(records) == 1
    assert records[0].total_workouts == 2
    assert records[0].total_calories == 350.0

def test_weekly_progress_summary(client, auth_headers):
    today = date.today()
    client.post("/workouts/", headers=auth_headers, json={
        "workout_name": "Cycling",
        "category": "Cardio",
        "duration": 40,
        "calories_burned": 320,
        "workout_date": today.isoformat()
    })
    client.post("/workouts/", headers=auth_headers, json={
        "workout_name": "Upper Body",
        "category": "Strength",
        "duration": 45,
        "calories_burned": 280,
        "workout_date": (today - timedelta(days=2)).isoformat()
    })

    res = client.get("/progress/weekly", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_workouts"] >= 2
    assert data["total_calories"] >= 600
    assert len(data["daily_breakdown"]) == 7

def test_monthly_progress_summary(client, auth_headers):
    today = date.today()
    res = client.get(f"/progress/monthly?year={today.year}&month={today.month}", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "total_workouts" in data
    assert "weekly_breakdown" in data
