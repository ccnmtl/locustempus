# Generated by Django 2.2.6 on 2020-04-28 20:57

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0005_auto_20200423_1608'),
    ]

    operations = [
        migrations.CreateModel(
            name='Assignment',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('instructions', models.CharField(max_length=256)),
                ('project', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='assignement', to='main.Project')),
            ],
        ),
        migrations.RenameField(
            model_name='response',
            old_name='project',
            new_name='assignment',
        ),
    ]
