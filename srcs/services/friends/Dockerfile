FROM python:3.9


COPY friends_app .
COPY ./conf/requirements.txt .


RUN pip install --upgrade pip && pip install -r requirements.txt

EXPOSE 8004

CMD ["python", "manage.py", "runserver", "0.0.0.0:8004"]
