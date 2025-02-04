# **Authentication and Permissions**

To ensure **secure internal communication**, every internal request must be **authenticated and authorized**.

## **Authentication**

Authentication is enforced by default through our custom `Authentication.py`.

- If a request contains an **invalid token**, it will be **immediately rejected**.
- We use **JWT tokens** for both users and services, applying different validation checks.

### **When is a Request Considered Authenticated?**

A request is **authenticated** if **at least one** of the following conditions is met:

### 1️⃣ **User Token Authentication**
- The request includes a **JWT token** in the `Authorization` header.
- Once **decoded**, the token must contain a `username` field that:
  - Matches the username in the **request URL**.
  - Exists in the **authentication database**.

**Example Request:**
```http
GET https://localhost:4430/api/users/<str:username>/
Authorization: Bearer <JWT>
```

### 2️⃣ **Service Token Authentication**
- The request includes a **Service Token**, which is **validated using the public key**.

---

## **Permissions**

All views **MUST** be protected by appropriate **permission classes** to enforce access control.

### **Available Permissions:**

### 1️⃣ `IsOwner`
Grants access **only if**:
- The **decoded token** contains a `"username"` field matching the **requested resource owner**.
- The user **exists in the database**.

**Example:**
- Request: `/api/users/LizaMonet`
- If the **token's `username` field** is `"Nicki"`, the request is **forbidden**.
- Only **LizaMonet** can access her own resources **with a valid token**.

---

### 2️⃣ `IsService`
Grants access to **microservices** based on service-level authentication.

A request is **allowed** if the token contains:
- A `"service_name"` field that matches the required service permission.
- Example service permissions: `[IsAuth]`, `[IsUsers]`, `[IsAvatar]`, etc.

🔹 **Example Logic:**
- If **Users Service** (`IsUsers`) tries to access an **Avatar Service** (`IsAvatar`) endpoint, the request is **forbidden**.
- This logic follows the same **ownership validation** as user-based authentication.

---

# **Internal Communication**

To optimize **service-to-service communication**, we implemented the **MicroserviceClient module** in every microservice.

🔹 **Key Benefit:**  
You **don’t need to manually extract tokens** every time you make an **internal request**.

### **How to Use `send_internal_request()`**

Use the `send_internal_request()` function to simplify internal requests.

**Example Implementation:**

```python
class TestView(APIView):
    def get(self, request, *args, **kwargs):
        # Define the internal URL (Refer to API Gateway URLs)
        url = 'http://<service_name>:8443/endpoint/'
        method = 'get'
        
        sender = MicroserviceClient
        response = sender.send_internal_request(url, method)
        return Response(response.data)

    def post(self, request, *args, **kwargs):
        url = 'http://<service_name>:8443/endpoint/'
        method = 'post'
        data = request.data  # Pass request data if needed
        
        sender = MicroserviceClient
        response = sender.send_internal_request(url, method, data)
        return Response(response.data)
```

---
