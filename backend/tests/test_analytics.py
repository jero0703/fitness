from datetime import date, timedelta

def test_analytics_endpoints(client, auth_headers):
    today = date.today()

    # Log 3 workouts across categories
    client.post("/workouts/", headers=auth_headers, json={
        "workout_name": "Running Interval",
        "category": "Cardio",
        "duration": 30,
        "calories_burned": 300,
        "workout_date": today.isoformat()
    })
    client.post("/workouts/", headers=auth_headers, json={
        "workout_name": "Powerlifting",
        "category": "Strength",
        "duration": 45,
        "calories_burned": 250,
        "workout_date": today.isoformat()
    })
    client.post("/workouts/", headers=auth_headers, json={
        "workout_name": "Vinyasa Flow",
        "category": "Yoga",
        "duration": 35,
        "calories_burned": 150,
        "workout_date": (today - timedelta(days=1)).isoformat()
    })

    # 1. Weekly analytics
    res_w = client.get("/analytics/weekly", headers=auth_headers)
    assert res_w.status_code == 200
    w_data = res_w.json()
    assert w_data["total_workouts"] >= 3
    assert w_data["total_calories"] >= 700
    assert len(w_data["chart_data"]) == 7

    # 2. Monthly analytics
    res_m = client.get("/analytics/monthly", headers=auth_headers)
    assert res_m.status_code == 200
    m_data = res_m.json()
    assert len(m_data["chart_data"]) == 30
    assert m_data["total_workouts"] >= 3

    # 3. Calories analytics
    res_c = client.get("/analytics/calories?days=14", headers=auth_headers)
    assert res_c.status_code == 200
    c_data = res_c.json()
    assert len(c_data["chart_data"]) == 14

    # 4. Categories analytics
    res_cat = client.get("/analytics/categories", headers=auth_headers)
    assert res_cat.status_code == 200
    cat_data = res_cat.json()
    assert cat_data["total_workouts"] >= 3
    categories = [c["name"] for c in cat_data["categories"]]
    assert "Cardio" in categories
    assert "Strength" in categories
    assert "Yoga" in categories
