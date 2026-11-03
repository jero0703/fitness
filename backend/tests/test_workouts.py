from datetime import date, timedelta

def test_create_workout(client, auth_headers):
    today = date.today().isoformat()
    response = client.post("/workouts/", headers=auth_headers, json={
        "workout_name": "Morning HIIT Session",
        "category": "HIIT",
        "duration": 45,
        "calories_burned": 420.5,
        "workout_date": today
    })
    assert response.status_code == 201
    data = response.json()
    assert data["workout_name"] == "Morning HIIT Session"
    assert data["category"] == "HIIT"
    assert data["duration"] == 45
    assert data["calories_burned"] == 420.5
    assert data["workout_date"] == today
    assert "id" in data

def test_create_workout_invalid_duration_and_calories(client, auth_headers):
    today = date.today().isoformat()
    # Negative duration
    response = client.post("/workouts/", headers=auth_headers, json={
        "workout_name": "Invalid Session",
        "category": "Cardio",
        "duration": 0,
        "calories_burned": 200,
        "workout_date": today
    })
    assert response.status_code == 422

    # Negative calories
    response2 = client.post("/workouts/", headers=auth_headers, json={
        "workout_name": "Invalid Session",
        "category": "Cardio",
        "duration": 30,
        "calories_burned": -50,
        "workout_date": today
    })
    assert response2.status_code == 422

def test_list_and_filter_workouts(client, auth_headers):
    d1 = (date.today() - timedelta(days=2)).isoformat()
    d2 = date.today().isoformat()

    client.post("/workouts/", headers=auth_headers, json={
        "workout_name": "Treadmill Run",
        "category": "Cardio",
        "duration": 30,
        "calories_burned": 300,
        "workout_date": d1
    })
    client.post("/workouts/", headers=auth_headers, json={
        "workout_name": "Heavy Bench Press",
        "category": "Strength",
        "duration": 50,
        "calories_burned": 350,
        "workout_date": d2
    })

    # All workouts
    res = client.get("/workouts/", headers=auth_headers)
    assert res.status_code == 200
    assert len(res.json()) >= 2

    # Filter by category
    res_cardio = client.get("/workouts/?category=Cardio", headers=auth_headers)
    assert res_cardio.status_code == 200
    cardio_items = res_cardio.json()
    assert all("Cardio" in item["category"] for item in cardio_items)

    # Search by name
    res_search = client.get("/workouts/?search=bench", headers=auth_headers)
    assert res_search.status_code == 200
    assert len(res_search.json()) == 1
    assert "Bench" in res_search.json()[0]["workout_name"]

def test_workout_ownership_security(client, auth_headers, second_auth_headers):
    # User 1 creates workout
    res = client.post("/workouts/", headers=auth_headers, json={
        "workout_name": "Private Pilates",
        "category": "Pilates",
        "duration": 40,
        "calories_burned": 220,
        "workout_date": date.today().isoformat()
    })
    w_id = res.json()["id"]

    # User 2 attempts to get it
    get_res = client.get(f"/workouts/{w_id}", headers=second_auth_headers)
    assert get_res.status_code == 403

    # User 2 attempts to update it
    put_res = client.put(f"/workouts/{w_id}", headers=second_auth_headers, json={
        "workout_name": "Hacked workout"
    })
    assert put_res.status_code == 403

    # User 2 attempts to delete it
    del_res = client.delete(f"/workouts/{w_id}", headers=second_auth_headers)
    assert del_res.status_code == 403

    # User 1 successfully updates it
    upd_res = client.put(f"/workouts/{w_id}", headers=auth_headers, json={
        "workout_name": "Private Pilates Updated",
        "duration": 45
    })
    assert upd_res.status_code == 200
    assert upd_res.json()["workout_name"] == "Private Pilates Updated"
    assert upd_res.json()["duration"] == 45

    # User 1 successfully deletes it
    del_ok = client.delete(f"/workouts/{w_id}", headers=auth_headers)
    assert del_ok.status_code == 204
