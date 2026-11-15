#!/bin/sh
# Бір файлға (sozdik-alemi.html) біріктіру: камера/микрофон үшін https-те ашуға ыңғайлы
cd "$(dirname "$0")"
python3 - <<'PY'
import re
h=open('index.html').read()
css=open('styles.css').read()
h=h.replace('<link rel="stylesheet" href="styles.css">','<style>\n'+css+'\n</style>')
js=''.join('\n'+open(f).read() for f in ['data.js','media.js','app.js'])
h=re.sub(r'<script src="data.js"></script>\s*<script src="media.js"></script>\s*<script src="app.js"></script>',lambda m:'<script>'+js.replace('</script>','<\\/script>')+'\n</script>',h)
open('soileu-alemi.html','w').write(h)
print(len(h)//1024,'KB')
PY
