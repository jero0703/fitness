def test_register_success(client):
    response = client.post("/auth/register", json={
        "username": "johndoe",
        "email": "john@example.com",
        "password": "Password123"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "johndoe"
    assert data["email"] == "john@example.com"
    assert "id" in data
    assert "password" not in data
    assert "hashed_password" not in data

def test_register_duplicate_email(client, test_user):
    response = client.post("/auth/register", json={
        "username": "alex2",
        "email": test_user.email,
        "password": "NewPassword123"
    })
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"].lower()

def test_register_invalid_input(client):
    # Short password
    response = client.post("/auth/register", json={
        "username": "joe",
        "email": "joe@example.com",
        "password": "123"
    })
    assert response.status_code == 422

def test_login_success(client, test_user):
    response = client.post("/auth/login", json={
        "email": "alex@fittrack.com",
        "password": "Secret123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "alex@fittrack.com"

def test_login_invalid_password(client, test_user):
    response = client.post("/auth/login", json={
        "email": "alex@fittrack.com",
        "password": "WrongPassword!"
    })
    assert response.status_code == 401
    assert "incorrect" in response.json()["detail"].lower()

def test_login_nonexistent_user(client):
    response = client.post("/auth/login", json={
        "email": "ghost@fittrack.com",
        "password": "Password123"
    })
    assert response.status_code == 401

def test_get_me_authenticated(client, auth_headers, test_user):
    response = client.get("/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_user.id
    assert data["email"] == test_user.email
    assert data["username"] == test_user.username

def test_get_me_unauthenticated(client):
    response = client.get("/auth/me")
    assert response.status_code == 401
