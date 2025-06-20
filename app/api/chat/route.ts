/**
 * API Route do Chat - Endpoint temporário
 * 
 * Este endpoint retorna 501 Not Implemented pois o chat deve usar
 * as rotas diretas do frontend para o backend, não uma API route proxy.
 */

import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Endpoint não implementado. Use as rotas diretas do frontend.' },
    { status: 501 }
  )
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Endpoint não implementado. Use as rotas diretas do frontend.' },
    { status: 501 }
  )
} 