# 🚀 WORKFLOW QUICKSTART - Task Master Development

**⚠️ MANDATORY**: Use este workflow antes de QUALQUER nova implementação.

## ⚡ Quick Steps (5 minutos de setup)

```bash
# 1️⃣ COPY & EDIT PRD
cp scripts/PRD-TEMPLATE.txt scripts/PRD.txt
# [Edit PRD.txt with your requirements]

# 2️⃣ GENERATE TASKS
task-master parse-prd scripts/PRD.txt --research --num-tasks=10

# 3️⃣ ANALYZE COMPLEXITY  
task-master analyze-complexity --research --threshold=6

# 4️⃣ EXPAND TASKS
task-master expand --all --research --force

# 5️⃣ START WORK
task-master next
```

## 🔄 During Development

```bash
# Mark completed
task-master set-status --id=5.1 --status=done

# Log progress  
task-master update-subtask --id=5.2 --prompt="Implementation notes"

# Get next task
task-master next
```

## 🚫 Never Do This
- ❌ Start coding without PRD
- ❌ Skip complexity analysis  
- ❌ Work without task structure

## ✅ Always Do This
- ✅ PRD first, always
- ✅ Follow the 5-step process
- ✅ Log progress regularly
- ✅ Use research flags

---
**Full Details**: See [development-workflow.mdc](mdc:.cursor/rules/development-workflow.mdc) 