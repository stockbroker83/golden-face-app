# test자동화 워크스페이스

이 폴더는 **Claude + Copilot 협업 개발**용 기본 템플릿입니다.

현재 메인 개발 대상은 `C:\Users\csu\OneDrive\Desktop\깃허브코드\youtube-analyzer` 입니다.

## 시작 순서

1. 폴더 열기
   - VS Code에서 `test자동화` 폴더를 엽니다.

2. Claude 실행
   - 터미널에서:
     ```powershell
     cd C:\Users\csu\OneDrive\Desktop\깃허브코드\test자동화
     claude
     ```

3. 역할 분담
   - Claude: 아이디어/초안/긴 리팩터 제안
   - Copilot: 실제 코드 반영/실행/오류 수정

4. 충돌 방지 규칙
   - 같은 파일을 동시에 수정하지 않기
   - 단계 종료마다 `git diff` 확인

## 빠른 작업 루프

1) 요구사항 정리 (`prompts/00_task_brief.md`)
2) Claude에게 초안 요청 (`prompts/10_claude_prompt.md`)
3) Copilot에게 적용/테스트 요청 (`prompts/20_copilot_prompt.md`)
4) 결과 검증 후 커밋

## 권장 명령

```powershell
# 메인 프로젝트로 이동
cd C:\Users\csu\OneDrive\Desktop\깃허브코드\youtube-analyzer

# 변경사항 확인
git status

# 변경 내용 확인
git diff
```
