from django.db import models
from django.utils import timezone

class UserProfile(models.Model):
    username = models.CharField(max_length=100, unique=True)
    biography = models.TextField()
    friends = models.ManyToManyField("self", blank=True, symmetrical=False)
    avatar_default_path = '/media/default_avatars/default_00.jpg'
    avatar = models.URLField(default='/media/default_avatars/default_00.jpg')
    last_seen = models.DateTimeField(null=True, blank=True)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    
    @property
    def is_authenticated(self):
        return True

    def is_online(self):
        if self.last_seen:
            return (timezone.now() - self.last_seen).seconds < 31
        return False
    
    def add_friend(self, friend_profile):
        if friend_profile != self and not self.friends.filter(pk=friend_profile.pk).exists():
            self.friends.add(friend_profile)
    
    def get_friends(self):
        return self.friends.all()
    
    def is_friend(self, friend_profile):
        return self.friends.filter(pk=friend_profile.pk).exists()

    def remove_friend(self, friend_profile):
        if self.friends.filter(pk=friend_profile.pk).exists():
            self.friends.remove(friend_profile)
