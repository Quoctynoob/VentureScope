import { NextRequest, NextResponse } from "next/server";
import { StartExecutionCommand } from "@aws-sdk/client-sfn";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { sfn, ddb, STEP_FUNCTIONS_ARN, DYNAMO_TABLE } from "@/lib/aws-clients";

function userIdFromToken(req: NextRequest): string {
  const token = req.headers.get("authorization") ?? "";
  if (!token) return "anonymous";
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub ?? "anonymous";
  } catch {
    return "anonymous";
  }
}

// POST /api/start-job
// Body: { jobId: string, s3Key: string }
// Returns: { executionArn }
export async function POST(req: NextRequest) {
  const { jobId, s3Key } = await req.json();
  const userId = userIdFromToken(req);

  if (!jobId || !s3Key) {
    return NextResponse.json(
      { error: "jobId and s3Key are required" },
      { status: 400 }
    );
  }

  // Write initial job record so polling gets 200 immediately
  await ddb.send(new PutCommand({
    TableName: DYNAMO_TABLE,
    Item: {
      jobId,
      userId,
      status: "PROCESSING",
      currentStep: "Starting pipeline...",
      inputS3Key: s3Key,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }));

  const { executionArn } = await sfn.send(new StartExecutionCommand({
    stateMachineArn: STEP_FUNCTIONS_ARN,
    name: jobId,
    input: JSON.stringify({ jobId, inputS3Key: s3Key, userId }),
  }));

  return NextResponse.json({ executionArn });
}
