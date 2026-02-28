FROM libretranslate/libretranslate:latest

# Override LibreTranslate web UI with the project frontend.
COPY public/index.html /app/libretranslate/templates/index.html
COPY public/Styles.css /app/libretranslate/static/Styles.css
COPY public/app.js /app/libretranslate/static/app.js
COPY docker-preload-models.py /tmp/docker-preload-models.py
RUN /app/venv/bin/python /tmp/docker-preload-models.py

COPY --chmod=755 docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
