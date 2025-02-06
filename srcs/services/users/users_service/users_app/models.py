from django.db import models

class Book(models.Model):
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=200)

    def __str__(self):
        return self.title


class UserProfile(models.Model):
    username = models.CharField(max_length=100, unique=True)
    biography = models.TextField()
    
    @property
    def is_authenticated(self):
        return True

