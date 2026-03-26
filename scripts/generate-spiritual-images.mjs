import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const outputDirectory = path.resolve(process.cwd(), 'public', 'assets', 'spiritual');
const openAiKey = process.env.OPENAI_API_KEY;

const imageJobs = [
  {
    key: 'mandir',
    prompt:
      'A grand Hindu temple with golden lighting, भक्त praying, sunrise, spiritual atmosphere, ultra realistic, 4k',
    fallbackUrl: 'https://loremflickr.com/1536/1024/temple,india,hindu?lock=101',
  },
  {
    key: 'prasad',
    prompt:
      'Traditional Indian prasad thali with laddoo, diya, temple background, warm golden lighting, realistic, 4k',
    fallbackUrl: 'https://loremflickr.com/1536/1024/indian,food,sweets,diya,temple?lock=102',
  },
  {
    key: 'aarti',
    prompt:
      'Hindu priest performing aarti with fire diya, भक्त gathered, smoke, cinematic lighting, ultra realistic',
    fallbackUrl: 'https://loremflickr.com/1536/1024/fire,prayer,temple,india?lock=103',
  },
  {
    key: 'meditation',
    prompt:
      'Person meditating in temple with divine light rays, peaceful spiritual aura, lotus, भगवान idol',
    fallbackUrl: 'https://loremflickr.com/1536/1024/meditation,temple,lotus,india?lock=104',
  },
  {
    key: 'pooja',
    prompt:
      'पूजा setup with kalash, coconut, flowers, diya, traditional arrangement, clean temple background',
    fallbackUrl: 'https://loremflickr.com/1536/1024/flowers,diya,temple,india?lock=105',
  },
];

async function ensureOutputDirectory() {
  await mkdir(outputDirectory, { recursive: true });
}

async function saveBuffer(fileName, arrayBuffer) {
  const filePath = path.join(outputDirectory, fileName);
  await writeFile(filePath, Buffer.from(arrayBuffer));
  return filePath;
}

async function downloadFallbackImage(job) {
  const response = await fetch(job.fallbackUrl, {
    headers: {
      'User-Agent': 'DivineConnect image bootstrapper',
    },
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`Fallback download failed for ${job.key}: ${response.status} ${response.statusText}`);
  }

  return saveBuffer(`${job.key}.jpg`, await response.arrayBuffer());
}

async function generateWithOpenAI(job) {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openAiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1.5',
      prompt: job.prompt,
      size: '1536x1024',
      quality: 'high',
      output_format: 'jpeg',
      output_compression: 85,
      response_format: 'b64_json',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI image generation failed for ${job.key}: ${response.status} ${errorText}`);
  }

  const payload = await response.json();
  const imageBase64 = payload?.data?.[0]?.b64_json;

  if (!imageBase64) {
    throw new Error(`OpenAI image generation returned no image data for ${job.key}.`);
  }

  const filePath = path.join(outputDirectory, `${job.key}.jpg`);
  await writeFile(filePath, Buffer.from(imageBase64, 'base64'));
  return filePath;
}

async function run() {
  await ensureOutputDirectory();

  console.log(`Saving spiritual images into ${outputDirectory}`);
  console.log(openAiKey ? 'Using OpenAI image generation.' : 'OPENAI_API_KEY missing, using free fallback image downloads.');

  for (const job of imageJobs) {
    try {
      const filePath = openAiKey
        ? await generateWithOpenAI(job)
        : await downloadFallbackImage(job);

      console.log(`Saved ${job.key} -> ${filePath}`);
    } catch (error) {
      console.error(`Failed for ${job.key}:`, error instanceof Error ? error.message : error);
      process.exitCode = 1;
    }
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
