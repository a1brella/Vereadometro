import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export async function GET() {
  try {
    const scriptPath = path.resolve(process.cwd(), "scripts", "intelpolitik_sync.py");
    const { stdout, stderr } = await execAsync(`python "${scriptPath}"`);

    return NextResponse.json({
      success: true,
      message: "Sincronização Intelpolitik executada com sucesso.",
      output: stdout,
      error: stderr || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.stderr || null,
      },
      { status: 500 }
    );
  }
}
