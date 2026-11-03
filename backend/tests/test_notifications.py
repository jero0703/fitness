def test_notifications_flow(client, auth_headers, second_auth_headers):
    # Trigger reminders or check existing
    client.post("/notifications/trigger-reminders", headers=auth_headers)

    # List notifications
    res = client.get("/notifications/", headers=auth_headers)
    assert res.status_code == 200
    notifs = res.json()
    assert len(notifs) >= 1
    first_id = notifs[0]["id"]

    # Check unread count
    res_count = client.get("/notifications/unread-count", headers=auth_headers)
    assert res_count.status_code == 200
    assert res_count.json()["unread_count"] >= 1

    # Mark single as read
    res_read = client.put(f"/notifications/{first_id}/read", headers=auth_headers)
    assert res_read.status_code == 200
    assert res_read.json()["is_read"] is True

    # Mark all read
    res_all = client.put("/notifications/read-all", headers=auth_headers)
    assert res_all.status_code == 200

    count_after = client.get("/notifications/unread-count", headers=auth_headers).json()["unread_count"]
    assert count_after == 0

    # User 2 cannot delete user 1's notification
    del_forbidden = client.delete(f"/notifications/{first_id}", headers=second_auth_headers)
    assert del_forbidden.status_code == 403

    # User 1 deletes
    del_ok = client.delete(f"/notifications/{first_id}", headers=auth_headers)
    assert del_ok.status_code == 204
