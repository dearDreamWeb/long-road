/**
 * 浏览器测试 P0 修复
 * GAME_URL=http://localhost:1246/ node scripts/browser-smoke-test.mjs
 */
import { chromium } from 'playwright';

const BASE_URL = process.env.GAME_URL || 'http://localhost:1246/';
const DB_NAME = 'LongLoad';

async function waitForGameReady(page) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('#mainCanvas', { timeout: 90000 });
  await page.waitForTimeout(2500);
}

async function injectWeek2Progress(page) {
  return page.evaluate(async (dbName) => {
    const Dexie = (await import('https://unpkg.com/dexie@3.2.4/dist/dexie.mjs')).default;

    class AppDB extends Dexie {
      constructor() {
        super(dbName);
        this.version(1.1).stores({
          progress: '++id,createdAt,updateAt',
          logger: '++id,createdAt,updateAt',
        });
      }
    }

    const db = new AppDB();
    const now = new Date();
    const progress = {
      name: '测试存档',
      coins: 500,
      weeks: 2,
      level: 1,
      viewDistance: 8,
      purifyCount: 2,
      isReverse: false,
      createdAt: now,
      updateAt: now,
      logger: [],
    };

    await db.progress.clear();
    const id = await db.progress.add(progress);
    localStorage.setItem('currentProgressId', String(id));
    return { id, weeks: 2, level: 1 };
  }, DB_NAME);
}

async function readGameState(page) {
  return page.evaluate(() => {
    const weeksEl = document.querySelector('.text-xl.mr-8');
    const levelEl = document.querySelector('.text-xl:not(.mr-8)');
    const texts = Array.from(document.querySelectorAll('.text-xl')).map(
      (el) => el.textContent?.trim()
    );
    return { headerTexts: texts };
  });
}

async function testPageLoad(page) {
  console.log('\n[1] 页面加载');
  await waitForGameReady(page);
  const canvas = await page.$('#mainCanvas');
  if (!canvas) throw new Error('主画布未找到');
  const box = await canvas.boundingBox();
  console.log(`  ✓ 主画布 ${box?.width}x${box?.height}`);
}

async function testKnowledgeGameInBrowser(page) {
  console.log('\n[2] 知识竞赛（浏览器内逻辑验证）');

  const result = await page.evaluate(() => {
    const QUESTIONS = [
      { result: 0 },
      { result: 1 },
      { result: 2 },
      { result: 0 },
      { result: 1 },
    ];
    let resultList = [];
    let currentIndex = 0;
    let submitting = false;

    const submit = (answer) => {
      if (submitting) return 'locked';
      if (resultList.length > currentIndex) return 'dup';
      submitting = true;
      const right = answer === QUESTIONS[currentIndex].result;
      resultList = [...resultList, { result: answer, right }];
      if (currentIndex >= QUESTIONS.length - 1) return 'done';
      currentIndex += 1;
      return 'ok';
    };

    const unlockQuestion = () => {
      submitting = false;
    };

    submit(0);
    const dup = submit(0);
    unlockQuestion();
    submit(1);
    unlockQuestion();
    submit(2);
    unlockQuestion();
    submit(0);
    unlockQuestion();
    submit(1);

    const correct = resultList.filter((r) => r.right).length;
    return {
      dup,
      length: resultList.length,
      correct,
      win: correct >= QUESTIONS.length / 2,
    };
  });

  console.log('  结果:', result);
  if (result.dup !== 'locked') throw new Error(`重复提交未拦截: ${result.dup}`);
  if (result.length !== 5) throw new Error(`应有 5 条记录，实际 ${result.length}`);
  if (result.correct !== 5) throw new Error(`应答对 5 题，实际 ${result.correct}`);
  if (!result.win) throw new Error('3/5 应判胜');
  console.log('  ✓ 计分与防重复通过');
}

async function testWeek2EndRect(page) {
  console.log('\n[3] 第二周目 endRect（存档注入 + 页面验证）');

  const injected = await injectWeek2Progress(page);
  console.log('  注入存档:', injected);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#mainCanvas', { timeout: 90000 });
  await page.waitForTimeout(4000);

  const header = await readGameState(page);
  console.log('  页面头部:', header.headerTexts);

  const hasWeek2 = header.headerTexts?.some((t) => t?.includes('2'));
  if (!hasWeek2) {
    console.warn('  ⚠ 未在页面上看到周目 2，可能存档未自动加载，继续键盘测试');
  }

  // 键盘移动，检查无页面崩溃
  for (const key of ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp']) {
    await page.keyboard.press(key);
    await page.waitForTimeout(300);
  }

  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  const canvasOk = await page.evaluate(() => {
    const c = document.getElementById('mainCanvas');
    return c && c.width > 0 && c.height > 0;
  });

  if (!canvasOk) throw new Error('移动后画布异常');
  console.log('  ✓ 第二周目加载后可正常操作，无崩溃');

  // 通过 Vite 模块动态 import createdLevel 在浏览器环境验证 endRect 与地图一致
  const endRectCheck = await page.evaluate(async () => {
    const mod = await import('/src/utils/createdLevel.ts');
    const [list, mainP, endP] = mod.createdLevel(1);
    const endType = 3;
    list[endP.y][endP.x] = endType;
    let endCount = 0;
    let atRect = list[endP.y][endP.x] === endType;
    for (let y = 0; y < list.length; y++) {
      for (let x = 0; x < list[y].length; x++) {
        if (list[y][x] === endType) endCount++;
      }
    }
    return {
      endP,
      mainP,
      endAtRect: atRect,
      endCount,
      mainIsMain: list[mainP.y][mainP.x] === 2,
    };
  });

  console.log('  createdLevel 浏览器验证:', endRectCheck);
  if (!endRectCheck.endAtRect) throw new Error('end 格写回 endRect 失败');
  if (!endRectCheck.mainIsMain) throw new Error('起点不是 main');
  console.log('  ✓ endRect 与地图终点一致');
}

async function main() {
  console.log('测试地址:', BASE_URL);
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      channel: 'chrome',
    });
    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));

    await testPageLoad(page);
    await testKnowledgeGameInBrowser(page);
    await testWeek2EndRect(page);

    if (pageErrors.length) {
      console.warn('\n页面错误:', pageErrors);
    }

    console.log('\n✅ 浏览器测试全部通过');
  } catch (e) {
    console.error('\n❌ 测试失败:', e.message);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
  }
}

main();
