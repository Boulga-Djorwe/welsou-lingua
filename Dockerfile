FROM libretranslate/libretranslate:latest

# Override LibreTranslate web UI with the project frontend.
COPY public/index.html /app/libretranslate/templates/index.html
COPY public/Styles.css /app/libretranslate/static/Styles.css
COPY public/app.js /app/libretranslate/static/app.js

CMD ["--host", "0.0.0.0", "--port", "5000"]
