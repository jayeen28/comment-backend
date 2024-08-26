db.createUser(
    {
        user: "jayeen",
        pwd: "6783",
        roles: [
            {
                role: "readWrite",
                db: "comment"
            }
        ]
    }
);
db.createCollection("comment");