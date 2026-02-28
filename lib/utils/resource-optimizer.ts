import { UserProfile, Task } from '@/lib/models'

export interface ScoredUser {
    user: UserProfile
    scores: {
        workload: number // 0-100
        skillMatch: number // 0-100
        performance: number // 0-100
        total: number // 0-100
    }
    explanation: string
}

const WEIGHTS = {
    workload: 0.4,
    skillMatch: 0.4,
    performance: 0.2,
}

// Factor 1: Workload (Capacity) Score
function calculateWorkloadScore(user: UserProfile, activeTasks: Task[], newTaskHours: number): number {
    const baseCapacity = user.baseCapacityHours || 40 // Default to 40 hours/week if not set

    // Sum up estimated hours of all active tasks assigned to this user
    const currentAssignedHours = activeTasks.reduce((sum, task) => {
        return sum + (task.estimatedHours || 0)
    }, 0)

    const projectedHours = currentAssignedHours + newTaskHours

    // If projected hours > capacity, score rapidly approaches 0
    if (projectedHours >= baseCapacity) {
        return Math.max(0, 100 - (projectedHours - baseCapacity) * 5) // Subtracted penalty for going over
    }

    // Score is percentage of free time left (100% score = totally free, 0% score = exactly at capacity)
    const freeHours = baseCapacity - projectedHours
    return Math.round((freeHours / baseCapacity) * 100)
}

// Factor 2: Skill Match Score
function calculateSkillMatchScore(userSkills: string[] = [], requiredSkills: string[] = []): number {
    if (requiredSkills.length === 0) return 100 // No specific skills required = perfect match for anyone

    let matchingSkills = 0
    requiredSkills.forEach(reqSkill => {
        // Basic case-insensitive matching
        if (userSkills.some(userSkill => userSkill.toLowerCase() === reqSkill.toLowerCase())) {
            matchingSkills++
        }
    })

    return Math.round((matchingSkills / requiredSkills.length) * 100)
}

// Factor 3: Past Performance Score
function calculatePerformanceScore(completedTasks: Task[]): number {
    if (completedTasks.length === 0) return 80 // Default baseline for new users

    const onTimeTasks = completedTasks.filter(task => {
        if (!task.completedDate) return false
        return task.completedDate.toMillis() <= task.dueDate.toMillis()
    })

    return Math.round((onTimeTasks.length / completedTasks.length) * 100)
}

export async function suggestAssignees(
    users: UserProfile[],
    allActiveTasks: Task[],
    allCompletedTasks: Task[],
    newTaskHours: number,
    requiredSkills: string[]
): Promise<ScoredUser[]> {

    const scoredUsers: ScoredUser[] = users.map(user => {
        const userActiveTasks = allActiveTasks.filter(t => t.assignedTo === user.id)
        const userCompletedTasks = allCompletedTasks.filter(t => t.assignedTo === user.id)

        const workload = calculateWorkloadScore(user, userActiveTasks, newTaskHours)
        const skillMatch = calculateSkillMatchScore(user.skills, requiredSkills)
        const performance = calculatePerformanceScore(userCompletedTasks)

        const total = Math.round(
            (workload * WEIGHTS.workload) +
            (skillMatch * WEIGHTS.skillMatch) +
            (performance * WEIGHTS.performance)
        )

        return {
            user,
            scores: { workload, skillMatch, performance, total },
            explanation: '' // Will be filled by LLM later, or with a fallback
        }
    })

    // Sort descending by total score
    const sorted = scoredUsers.sort((a, b) => b.scores.total - a.scores.total)

    // Return top 3 candidates
    return sorted.slice(0, 3)
}

export async function generateExplanations(candidates: ScoredUser[], taskTitle: string): Promise<ScoredUser[]> {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
        console.warn('OPENROUTER_API_KEY missing. Returning fallback explanations.')
        return candidates.map(c => ({
            ...c,
            explanation: `Match score: ${c.scores.total}%. Workload: ${c.scores.workload}%, Skills: ${c.scores.skillMatch}%.`
        }))
    }

    try {
        const promptData = candidates.map(c =>
            `User: ${c.user.name}, Total Match: ${c.scores.total}%, Workload Freedom: ${c.scores.workload}%, Skill Match: ${c.scores.skillMatch}%, Past Performance: ${c.scores.performance}%`
        ).join('\n')

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-exp:free',
                messages: [{
                    role: 'system',
                    content: 'You are an AI Manager Assistant. I will provide raw data about 3 employees who were mathmatically selected as the best fit for a task. For each employee, write a very short, one-sentence punchy explanation (max 15 words) explaining why they were chosen based *only* on the provided data.'
                }, {
                    role: 'user',
                    content: `Task: ${taskTitle}\n\nCandidates:\n${promptData}\n\nReturn EXACTLY a JSON array of strings (the 3 explanations in order). Do not return markdown. Just the array. Example: ["Excellent skill match and high capacity.", "Great historical performance.", "Perfect capacity score."]`
                }]
            })
        });

        if (!response.ok) throw new Error('Failed to fetch from OpenRouter')

        const data = await response.json()
        const content = data.choices[0].message.content

        // Attempt to parse the JSON array
        // Fallback or simple cleanup if it has codeblocks
        const jsonMatch = content.match(/\[[\s\S]*\]/)
        const jsonString = jsonMatch ? jsonMatch[0] : content

        const parsedExplanations = JSON.parse(jsonString)

        if (Array.isArray(parsedExplanations) && parsedExplanations.length === candidates.length) {
            return candidates.map((c, i) => ({
                ...c,
                explanation: parsedExplanations[i]
            }))
        }
        throw new Error('Invalid JSON format returned from LLM')
    } catch (error) {
        console.error('LLM Explanation Error:', error)
        return candidates.map(c => ({
            ...c,
            explanation: `Match score: ${c.scores.total}%. (AI Explanation Failed)`
        }))
    }
}

// Master function
export async function getAISuggestions(
    users: UserProfile[],
    allActiveTasks: Task[],
    allCompletedTasks: Task[],
    newTaskHours: number,
    requiredSkills: string[],
    taskTitle: string
): Promise<ScoredUser[]> {
    const heuristicCandidates = await suggestAssignees(users, allActiveTasks, allCompletedTasks, newTaskHours, requiredSkills)
    return await generateExplanations(heuristicCandidates, taskTitle)
}
