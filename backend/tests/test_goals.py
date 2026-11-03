from datetime import date, timedelta

def test_goal_lifecycle_and_status(client, auth_headers):
    future_date = (date.today() + timedelta(days=30)).isoformat()

    # 1. Create a goal: Weight Loss
    res = client.post("/goals/", headers=auth_headers, json={
        "goal_type": "Weight Loss",
        "target_value": 10.0,
        "current_value": 0.0,
        "deadline": future_date
    })
    assert res.status_code == 201
    goal = res.json()
    assert goal["status"] == "NOT_STARTED"
    assert goal["percentage"] == 0.0
    goal_id = goal["id"]

    # 2. Update to in-progress
    res_upd = client.put(f"/goals/{goal_id}", headers=auth_headers, json={
        "current_value": 4.0
    })
    assert res_upd.status_code == 200
    goal_upd = res_upd.json()
    assert goal_upd["status"] == "IN_PROGRESS"
    assert goal_upd["percentage"] == 40.0

    # 3. Complete goal
    res_comp = client.put(f"/goals/{goal_id}", headers=auth_headers, json={
        "current_value": 10.0
    })
    assert res_comp.status_code == 200
    goal_comp = res_comp.json()
    assert goal_comp["status"] == "COMPLETED"
    assert goal_comp["percentage"] == 100.0

    # Verify notification generated upon completion
    notifs = client.get("/notifications/", headers=auth_headers).json()
    assert any("Goal Achieved" in n["title"] for n in notifs)

def test_overdue_goal(client, auth_headers):
    past_date = (date.today() - timedelta(days=5)).isoformat()
    res = client.post("/goals/", headers=auth_headers, json={
        "goal_type": "Steps",
        "target_value": 10000,
        "current_value": 5000,
        "deadline": past_date
    })
    assert res.status_code == 201
    data = res.json()
    assert data["status"] == "OVERDUE"
    assert data["is_overdue"] is True

def test_goal_ownership(client, auth_headers, second_auth_headers):
    res = client.post("/goals/", headers=auth_headers, json={
        "goal_type": "Muscle Gain",
        "target_value": 5.0,
        "current_value": 1.0,
        "deadline": (date.today() + timedelta(days=20)).isoformat()
    })
    g_id = res.json()["id"]

    # Second user cannot access or delete
    assert client.get(f"/goals/{g_id}", headers=second_auth_headers).status_code == 403
    assert client.delete(f"/goals/{g_id}", headers=second_auth_headers).status_code == 403

    # Primary user can delete
    assert client.delete(f"/goals/{g_id}", headers=auth_headers).status_code == 204
