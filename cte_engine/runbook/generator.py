import datetime

def generate_runbook(task, plans, reviews, divergence, synthesis, run_id):
    return {
        "run_id": run_id,
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "task": task,
        "metrics": {
            "divergence": divergence,
            "plan_count": len(plans)
        },
        "synthesis": synthesis,
        "details": {
            "plans": plans,
            "reviews": reviews
        }
    }