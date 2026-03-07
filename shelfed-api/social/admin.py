from django.contrib import admin
from .models import Shelf, ShelfItem, ReadingLog, Review, Follow

admin.site.register(Shelf)
admin.site.register(ShelfItem)
admin.site.register(ReadingLog)
admin.site.register(Review)
admin.site.register(Follow)