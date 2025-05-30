## Natural-JS Guide 문서 작성

- Natural-JS의 패키지들의 공식 명칭은 Natural-CORE, Natural-ARCHITECTURE, Natural-DATA, Natural-UI, Natural-Shell 으로 작성합니다.
- 먼저 영문 문서를 만들어서 `{ProjectRoot}/docs` 디렉토리에 저장하고 `{ProjectRoot}/docs/ko` 에 한국어로 번역해서 같은 파일이름으로 저장합니다.
- 완료된 문서는 `{ProjectRoot}/docs/` 디렉토리에 Markdown으로 저장합니다.
  - 파일명은 `etc/sitemap.md` 파일에 있는 문서의 이름을 영어로 번역해서 소문자로 작성합니다.
- `etc/sitemap.md` 파일의 기능 목록에 해당하는 디렉토리의 html 과 md 파일의 내용으로 작성합니다.
  - 조회한 가이드 문서(html, md등)의 내용을 그대로 빠짐없이 반영합니다. 
  - 이미지 파일의 내용은 Mermaid 로 변환해서 작성합니다.
  - `etc/sitemap.md` 파일의 파일 목록 하나하나를 작업으로 등록한 작업계획 문서를 생성하고 진행합니다.
    - 이미 작성되어 있다면 작업되지 않은 작업을 계속 진행합니다.
    - 파일은 `etc/tasks.md` 로 저장합니다.
    - 작업명 앞에 체크박스를 둬서 완료된 작업은 체크 합니다.
    - 작업이 하나 끝날때마다 이터레이션을 새로 진행합니다.
- 물어보지 않고 바로 작업을 자동으로 계속 진행합니다.