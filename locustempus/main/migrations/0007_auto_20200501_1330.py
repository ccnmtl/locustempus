# Generated by Django 2.2.6 on 2020-05-01 17:30

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('main', '0006_auto_20200428_1657'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='response',
            name='user',
        ),
        migrations.AddField(
            model_name='assignment',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='assignment',
            name='created_by',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='assignment',
            name='modified_at',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddField(
            model_name='assignment',
            name='modified_by',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='layer',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='layer',
            name='created_by',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='layer',
            name='modified_at',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddField(
            model_name='layer',
            name='modified_by',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='project',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='project',
            name='created_by',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='project',
            name='modified_at',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddField(
            model_name='project',
            name='modified_by',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='response',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='response',
            name='created_by',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='response',
            name='modified_at',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddField(
            model_name='response',
            name='modified_by',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='assignment',
            name='project',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='assignment', to='main.Project'),
        ),
        migrations.AlterField(
            model_name='response',
            name='assignment',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='responses', to='main.Assignment'),
        ),
        migrations.CreateModel(
            name='ResponseOwner',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('assignment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='+', to='main.Assignment')),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('response', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='main.Response')),
            ],
            options={
                'unique_together': {('owner', 'response', 'assignment')},
            },
        ),
        migrations.AddField(
            model_name='response',
            name='owners',
            field=models.ManyToManyField(through='main.ResponseOwner', to=settings.AUTH_USER_MODEL),
        ),
    ]
