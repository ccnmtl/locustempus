"""
Add user created_by and modified_by foreign key refs to any model
automatically. Almost entirely taken from
https://github.com/Atomidata/django-audit-log/
    blob/master/audit_log/middleware.py
"""
from django.db.models import signals
from django.utils.functional import curry


class WhoDidItMiddleware(object):

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.method not in ('GET', 'HEAD', 'OPTIONS', 'TRACE'):
            if hasattr(request, 'user') and request.user.is_authenticated:
                user = request.user
            else:
                user = None

            mark_whodidit = curry(self.mark_whodidit, user)
            signals.pre_save.connect(
                mark_whodidit,
                dispatch_uid=(self.__class__, request,),
                weak=False)

        response = self.get_response(request)

        signals.pre_save.disconnect(dispatch_uid=(self.__class__, request,))

        return response

    def mark_whodidit(self, user, sender, instance, **kwargs):
        if not getattr(instance, 'created_by_id', None):
            instance.created_by = user
        if hasattr(instance, 'modified_by_id'):
            instance.modified_by = user
