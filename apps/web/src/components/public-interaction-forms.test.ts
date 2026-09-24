import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, test } from 'vitest';

function readGlobalStyles() {
  return [
    'src/app/styles/base.css',
    'src/app/styles/public.css',
    'src/app/styles/home.css',
    'src/app/styles/content.css',
    'src/app/styles/leetcode.css',
    'src/app/styles/share.css',
    'src/app/styles/admin.css',
    'src/app/styles/responsive.css',
  ]
    .map((path) => readFileSync(join(process.cwd(), path), 'utf8'))
    .join('\n');
}

describe('public interaction forms', () => {
  test('limits comment and guestbook field lengths before submission', () => {
    const commentForm = readFileSync(join(process.cwd(), 'src/components/CommentForm.tsx'), 'utf8');
    const guestbookForm = readFileSync(join(process.cwd(), 'src/components/GuestbookForm.tsx'), 'utf8');
    const bodyField = readFileSync(join(process.cwd(), 'src/components/PublicSubmissionBodyField.tsx'), 'utf8');

    expect(commentForm).not.toContain('maxLength={PUBLIC_SUBMISSION_LIMITS.authorName}');
    expect(guestbookForm).not.toContain('maxLength={PUBLIC_SUBMISSION_LIMITS.authorName}');
    expect(bodyField).toContain('PUBLIC_SUBMISSION_LIMITS');
    expect(bodyField).toContain('maxLength={PUBLIC_SUBMISSION_LIMITS.body}');
    expect(bodyField).not.toContain('maxLength={PUBLIC_SUBMISSION_LIMITS.authorName}');
  });

  test('requires GitHub reader login before showing the comment form', () => {
    const commentForm = readFileSync(join(process.cwd(), 'src/components/CommentForm.tsx'), 'utf8');
    const contentDetail = readFileSync(join(process.cwd(), 'src/components/ContentDetail.tsx'), 'utf8');
    const loginGatePath = join(process.cwd(), 'src/components/PublicGitHubLoginGate.tsx');

    expect(contentDetail).toContain('loadReaderSession');
    expect(contentDetail).toContain('const cookieHeader = (await cookies()).toString();');
    expect(contentDetail).toContain('reader={readerSession.authenticated ? readerSession : null}');
    expect(existsSync(loginGatePath)).toBe(true);
    expect(commentForm).toContain("import { PublicGitHubLoginGate } from '@/components/PublicGitHubLoginGate';");
    expect(commentForm).toContain("import { useEffect, useId, useRef, useState } from 'react';");
    expect(commentForm).toContain('const [loginGateOpen, setLoginGateOpen] = useState(false);');
    expect(commentForm).toContain('const loginModalRef = useRef<HTMLDivElement>(null);');
    expect(commentForm).toContain('loginModalRef.current?.scrollIntoView');
    expect(commentForm).toContain('block: \'nearest\'');
    expect(commentForm).toContain('reader: AuthenticatedReaderSession | null');
    expect(commentForm).toContain('className="comment-login-entry__button"');
    expect(commentForm).toContain('onClick={() => setLoginGateOpen(true)}');
    expect(commentForm).toContain('{loginGateOpen ? (');
    expect(commentForm).toContain('ref={loginModalRef} className="comment-login-modal"');
    expect(commentForm).toContain('<PublicGitHubLoginGate');
    expect(commentForm).toContain('nextPath={loginNextPath}');
    expect(commentForm).toContain('GitHub 登录后评论');
    expect(commentForm).not.toContain('name="authorName"');
  });

  test('shows direct-publish copy after GitHub comment and guestbook submission', () => {
    const commentForm = readFileSync(join(process.cwd(), 'src/components/CommentForm.tsx'), 'utf8');
    const guestbookForm = readFileSync(join(process.cwd(), 'src/components/GuestbookForm.tsx'), 'utf8');
    const inlineCommentLayer = readFileSync(join(process.cwd(), 'src/components/InlineCommentLayer.tsx'), 'utf8');

    expect(commentForm).toContain('评论已发布。');
    expect(commentForm).not.toContain('审核通过后会公开显示');
    expect(guestbookForm).toContain('留言已发布。');
    expect(guestbookForm).not.toContain('审核通过后会显示在这里');
    expect(inlineCommentLayer).toContain('划线评论已发布。');
    expect(inlineCommentLayer).not.toContain('审核通过后会公开显示');
  });

  test('prevents duplicate public submissions and clears successful form text', () => {
    const commentForm = readFileSync(join(process.cwd(), 'src/components/CommentForm.tsx'), 'utf8');
    const guestbookForm = readFileSync(join(process.cwd(), 'src/components/GuestbookForm.tsx'), 'utf8');
    const inlineCommentLayer = readFileSync(join(process.cwd(), 'src/components/InlineCommentLayer.tsx'), 'utf8');
    const submitButton = readFileSync(join(process.cwd(), 'src/components/PublicSubmissionSubmitButton.tsx'), 'utf8');
    const hookPath = join(process.cwd(), 'src/components/usePublicSubmissionForm.ts');

    expect(existsSync(hookPath)).toBe(true);

    const submissionHook = readFileSync(hookPath, 'utf8');

    expect(submissionHook).toContain("import { useRef, useState } from 'react';");
    expect(submissionHook).toContain('export function usePublicSubmissionForm');
    expect(submissionHook).toContain('const formRef = useRef<HTMLFormElement>(null);');
    expect(submissionHook).toContain('const [isSubmitting, setIsSubmitting] = useState(false);');
    expect(submissionHook).toContain('setIsSubmitting(true);');
    expect(submissionHook).toContain('setIsSubmitting(false);');
    expect(submissionHook).toContain('formRef.current?.reset();');
    expect(submissionHook).toContain('setBody(\'\');');
    expect(submissionHook).toContain("const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');");
    expect(submissionHook).toContain("setStatus('success');");
    expect(submissionHook).toContain("setStatus('error');");
    expect(submissionHook).toContain("'aria-live': 'polite'");
    expect(submissionHook).toContain("role: 'status'");
    expect(submissionHook).toContain('className: `form-message form-message--${status}`');

    for (const source of [commentForm, guestbookForm, inlineCommentLayer]) {
      expect(source).toContain("import { usePublicSubmissionForm } from '@/components/usePublicSubmissionForm';");
      expect(source).toContain('usePublicSubmissionForm');
      expect(source).toContain('disabled={isSubmitting || isBodyBlank}');
      expect(source).toContain('{...statusProps}');
    }

    expect(submitButton).toContain("{isSubmitting ? '提交中' : children}");
    expect(commentForm).toContain('提交评论');
    expect(guestbookForm).toContain('提交留言');
    expect(inlineCommentLayer).toContain('提交划线评论');
  });

  test('shows readable API errors for failed public submissions', () => {
    const submissionHook = readFileSync(join(process.cwd(), 'src/components/usePublicSubmissionForm.ts'), 'utf8');

    expect(submissionHook).toContain("import { PUBLIC_SUBMISSION_LIMITS, readInteractionErrorMessage } from '@/lib/interaction-client';");
    expect(submissionHook).toContain('const errorMessage = await readInteractionErrorMessage(response, failureMessage);');
    expect(submissionHook).toContain('setMessage(errorMessage);');
  });

  test('exposes public submission busy state to assistive technology', () => {
    const commentForm = readFileSync(join(process.cwd(), 'src/components/CommentForm.tsx'), 'utf8');
    const guestbookForm = readFileSync(join(process.cwd(), 'src/components/GuestbookForm.tsx'), 'utf8');
    const inlineCommentLayer = readFileSync(join(process.cwd(), 'src/components/InlineCommentLayer.tsx'), 'utf8');
    const submitButton = readFileSync(join(process.cwd(), 'src/components/PublicSubmissionSubmitButton.tsx'), 'utf8');

    for (const source of [commentForm, guestbookForm, inlineCommentLayer]) {
      expect(source).toContain("aria-busy={isSubmitting}");
      expect(source).toContain('disabled={isSubmitting || isBodyBlank}');
    }

    expect(submitButton).toContain('aria-disabled={disabled}');
    expect(submitButton).toContain('disabled={disabled}');
  });

  test('disables public submission buttons until the body has non-whitespace text', () => {
    const commentForm = readFileSync(join(process.cwd(), 'src/components/CommentForm.tsx'), 'utf8');
    const guestbookForm = readFileSync(join(process.cwd(), 'src/components/GuestbookForm.tsx'), 'utf8');
    const inlineCommentLayer = readFileSync(join(process.cwd(), 'src/components/InlineCommentLayer.tsx'), 'utf8');
    const submissionHook = readFileSync(join(process.cwd(), 'src/components/usePublicSubmissionForm.ts'), 'utf8');

    expect(submissionHook).toContain('const isBodyBlank = body.trim().length === 0;');
    expect(submissionHook).toContain('isBodyBlank,');

    for (const source of [commentForm, guestbookForm, inlineCommentLayer]) {
      expect(source).toContain('isBodyBlank');
      expect(source).toContain('disabled={isSubmitting || isBodyBlank}');
    }
  });

  test('shares one submit button component across public submission forms', () => {
    const submitButtonPath = join(process.cwd(), 'src/components/PublicSubmissionSubmitButton.tsx');
    const commentForm = readFileSync(join(process.cwd(), 'src/components/CommentForm.tsx'), 'utf8');
    const guestbookForm = readFileSync(join(process.cwd(), 'src/components/GuestbookForm.tsx'), 'utf8');
    const inlineCommentLayer = readFileSync(join(process.cwd(), 'src/components/InlineCommentLayer.tsx'), 'utf8');

    expect(existsSync(submitButtonPath)).toBe(true);

    const submitButton = readFileSync(submitButtonPath, 'utf8');

    expect(submitButton).toContain('export function PublicSubmissionSubmitButton');
    expect(submitButton).toContain("type=\"submit\"");
    expect(submitButton).toContain('disabled={disabled}');
    expect(submitButton).toContain('aria-disabled={disabled}');
    expect(submitButton).toContain("{isSubmitting ? '提交中' : children}");

    for (const source of [commentForm, guestbookForm, inlineCommentLayer]) {
      expect(source).toContain("import { PublicSubmissionSubmitButton } from '@/components/PublicSubmissionSubmitButton';");
      expect(source).toContain('<PublicSubmissionSubmitButton');
      expect(source).toContain('disabled={isSubmitting || isBodyBlank}');
      expect(source).toContain('isSubmitting={isSubmitting}');
      expect(source).not.toContain('<button type="submit"');
    }

    expect(commentForm).toContain('提交评论');
    expect(guestbookForm).toContain('提交留言');
    expect(inlineCommentLayer).toContain('提交划线评论');
  });

  test('shows live body length feedback for public submissions', () => {
    const commentForm = readFileSync(join(process.cwd(), 'src/components/CommentForm.tsx'), 'utf8');
    const guestbookForm = readFileSync(join(process.cwd(), 'src/components/GuestbookForm.tsx'), 'utf8');
    const inlineCommentLayer = readFileSync(join(process.cwd(), 'src/components/InlineCommentLayer.tsx'), 'utf8');
    const bodyField = readFileSync(join(process.cwd(), 'src/components/PublicSubmissionBodyField.tsx'), 'utf8');
    const submissionHook = readFileSync(join(process.cwd(), 'src/components/usePublicSubmissionForm.ts'), 'utf8');
    const styles = readGlobalStyles();

    expect(submissionHook).toContain('const [body, setBody] = useState');
    expect(submissionHook).toContain('const remainingBodyLength = PUBLIC_SUBMISSION_LIMITS.body - body.length;');
    expect(submissionHook).toContain('setBody(\'\');');

    for (const source of [commentForm, guestbookForm, inlineCommentLayer]) {
      expect(source).toContain('body={body}');
      expect(source).toContain('onBodyChange={setBody}');
      expect(source).toContain('remainingBodyLength={remainingBodyLength}');
    }

    expect(bodyField).toContain('interaction-form__counter');
    expect(bodyField).toContain('interaction-form__counter--warning');
    expect(bodyField).toContain('剩余 {remainingBodyLength} 字');
    expect(bodyField).toContain('value={body}');
    expect(bodyField).toContain('onChange={(event) => onBodyChange(event.target.value)}');
    expect(styles).toContain('.interaction-form__counter');
    expect(styles).toContain('.interaction-form__counter--warning');
  });

  test('shares one body field component across public submission forms', () => {
    const bodyFieldPath = join(process.cwd(), 'src/components/PublicSubmissionBodyField.tsx');
    const commentForm = readFileSync(join(process.cwd(), 'src/components/CommentForm.tsx'), 'utf8');
    const guestbookForm = readFileSync(join(process.cwd(), 'src/components/GuestbookForm.tsx'), 'utf8');
    const inlineCommentLayer = readFileSync(join(process.cwd(), 'src/components/InlineCommentLayer.tsx'), 'utf8');

    expect(existsSync(bodyFieldPath)).toBe(true);

    const bodyField = readFileSync(bodyFieldPath, 'utf8');

    expect(bodyField).toContain('export function PublicSubmissionBodyField');
    expect(bodyField).toContain('PUBLIC_SUBMISSION_LIMITS.body');
    expect(bodyField).toContain('aria-describedby={counterId}');
    expect(bodyField).toContain('interaction-form__counter');
    expect(bodyField).toContain('interaction-form__counter--warning');
    expect(bodyField).toContain('剩余 {remainingBodyLength} 字');

    for (const source of [commentForm, guestbookForm, inlineCommentLayer]) {
      expect(source).toContain("import { PublicSubmissionBodyField } from '@/components/PublicSubmissionBodyField';");
      expect(source).toContain('<PublicSubmissionBodyField');
      expect(source).not.toContain('<textarea');
      expect(source).not.toContain('interaction-form__counter');
    }
  });

  test('associates public submission body counters with their textareas', () => {
    const commentForm = readFileSync(join(process.cwd(), 'src/components/CommentForm.tsx'), 'utf8');
    const guestbookForm = readFileSync(join(process.cwd(), 'src/components/GuestbookForm.tsx'), 'utf8');
    const inlineCommentLayer = readFileSync(join(process.cwd(), 'src/components/InlineCommentLayer.tsx'), 'utf8');
    const bodyField = readFileSync(join(process.cwd(), 'src/components/PublicSubmissionBodyField.tsx'), 'utf8');

    for (const source of [commentForm, guestbookForm, inlineCommentLayer]) {
      expect(source).toContain('useId');
      expect(source).toContain('const bodyCounterId = useId();');
      expect(source).toContain('counterId={bodyCounterId}');
    }

    expect(bodyField).toContain('aria-describedby={counterId}');
    expect(bodyField).toContain('id={counterId}');
  });

  test('keeps the guestbook form out of the disabled public guestbook route', () => {
    const guestbookForm = readFileSync(join(process.cwd(), 'src/components/GuestbookForm.tsx'), 'utf8');
    const guestbookPage = readFileSync(join(process.cwd(), 'src/app/guestbook/page.tsx'), 'utf8');

    expect(guestbookPage).toContain('留言功能已关闭');
    expect(guestbookPage).not.toContain('loadReaderSession');
    expect(guestbookPage).not.toContain('<GuestbookForm reader={readerSession.authenticated ? readerSession : null} />');
    expect(guestbookForm).toContain("import { PublicGitHubLoginGate } from '@/components/PublicGitHubLoginGate';");
    expect(guestbookForm).toContain('reader: AuthenticatedReaderSession | null');
    expect(guestbookForm).toContain('<PublicGitHubLoginGate');
    expect(guestbookForm).toContain('nextPath="/guestbook"');
    expect(guestbookForm).toContain('GitHub 登录后留言');
    expect(guestbookForm).not.toContain('name="authorName"');
  });

  test('shares one GitHub login gate across public comment surfaces', () => {
    const loginGate = readFileSync(join(process.cwd(), 'src/components/PublicGitHubLoginGate.tsx'), 'utf8');
    const commentForm = readFileSync(join(process.cwd(), 'src/components/CommentForm.tsx'), 'utf8');
    const guestbookForm = readFileSync(join(process.cwd(), 'src/components/GuestbookForm.tsx'), 'utf8');
    const inlineCommentLayer = readFileSync(join(process.cwd(), 'src/components/InlineCommentLayer.tsx'), 'utf8');

    expect(loginGate).toContain('export function PublicGitHubLoginGate');
    expect(loginGate).toContain('encodeURIComponent(nextPath)');
    expect(loginGate).toContain('guestbook-login-gate');
    expect(loginGate).toContain('aria-label="GitHub 登录提示"');
    expect(loginGate).toContain('发布后会直接显示');

    for (const source of [commentForm, guestbookForm, inlineCommentLayer]) {
      expect(source).toContain("import { PublicGitHubLoginGate } from '@/components/PublicGitHubLoginGate';");
      expect(source).toContain('<PublicGitHubLoginGate');
      expect(source).not.toContain('<div className="guestbook-login-gate">');
    }
  });

  test('shares one reader identity badge across public submission forms', () => {
    const readerIdentityPath = join(process.cwd(), 'src/components/PublicReaderIdentity.tsx');
    const commentForm = readFileSync(join(process.cwd(), 'src/components/CommentForm.tsx'), 'utf8');
    const guestbookForm = readFileSync(join(process.cwd(), 'src/components/GuestbookForm.tsx'), 'utf8');
    const inlineCommentLayer = readFileSync(join(process.cwd(), 'src/components/InlineCommentLayer.tsx'), 'utf8');

    expect(existsSync(readerIdentityPath)).toBe(true);

    const readerIdentity = readFileSync(readerIdentityPath, 'utf8');

    expect(readerIdentity).toContain('export function PublicReaderIdentity');
    expect(readerIdentity).toContain('aria-label="GitHub 当前身份"');
    expect(readerIdentity).toContain('guestbook-reader');
    expect(readerIdentity).toContain('reader.displayName');
    expect(readerIdentity).toContain('@{reader.login}');
    expect(readerIdentity).toContain('target="_blank"');
    expect(readerIdentity).toContain('rel="noreferrer"');

    for (const source of [commentForm, guestbookForm, inlineCommentLayer]) {
      expect(source).toContain("import { PublicReaderIdentity } from '@/components/PublicReaderIdentity';");
      expect(source).toContain('<PublicReaderIdentity reader={reader} />');
      expect(source).not.toContain('<div className="guestbook-reader">');
    }
  });

  test('keeps public guestbook disabled without exposing guestbook entry points', () => {
    const guestbookPage = readFileSync(join(process.cwd(), 'src/app/guestbook/page.tsx'), 'utf8');
    const navigation = readFileSync(join(process.cwd(), 'src/lib/navigation.ts'), 'utf8');
    const adminOverview = readFileSync(join(process.cwd(), 'src/app/admin/page.tsx'), 'utf8');
    const aboutPage = readFileSync(join(process.cwd(), 'src/app/about/page.tsx'), 'utf8');

    expect(guestbookPage).toContain('留言功能已关闭');
    expect(guestbookPage).toContain('className="page-main guestbook-page guestbook-page--disabled"');
    expect(guestbookPage).not.toContain('notFound();');
    expect(guestbookPage).not.toContain('用 GitHub 登录后留一句话，发布后会直接显示在这里。');
    expect(guestbookPage).not.toContain("description: '读者留言和站点交流，需要 GitHub 登录后发布。'");
    expect(guestbookPage).not.toContain('审核队列');
    expect(guestbookPage).not.toContain('审核通过');
    expect(navigation).not.toContain("href: '/admin/guestbook'");
    expect(navigation).not.toContain("{ href: '/guestbook', label: '留言' }");
    expect(navigation).not.toContain('留言审核');
    expect(adminOverview).not.toContain("'/admin/guestbook'");
    expect(aboutPage).not.toContain('href="/guestbook"');
  });
});
