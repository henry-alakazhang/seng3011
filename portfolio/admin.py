from django.contrib import admin
from .models import *

# Register your models here.

class UserPortFolioAdmin(admin.ModelAdmin):
    list_display = ('id','user',  'portfolio')

admin.site.register(UserPortfolio, UserPortFolioAdmin)
