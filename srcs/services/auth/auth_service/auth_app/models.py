from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.timezone import now

class Book(models.Model):
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=200)

    def __str__(self):
        return self.title
    
class CustomUser(AbstractUser):
    last_active = models.DateTimeField(default=now)
    @property
    def is_authenticated(self):
        return True
    

