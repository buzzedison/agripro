import { type SchemaTypeDefinition } from 'sanity'
import bestPractices from '../../app/knowledgehub/schemas/bestPractices'
import expert from '@/app/knowledgehub/schemas/expert'
import expertApplication from '@/app/knowledgehub/schemas/expertApplication'
import whitepaper from '@/app/knowledgehub/schemas/whitepaper'
import course from '@/app/knowledgehub/schemas/course'
import insight from '@/app/knowledgehub/schemas/insight'
import research from '@/app/knowledgehub/schemas/research'
import event from '../../app/knowledgehub/schemas/event'
import video from '../../app/knowledgehub/schemas/video'
import roiCalculation from '@/app/knowledgehub/schemas/roiCalculation'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [bestPractices, expert, expertApplication, whitepaper, course, insight, research, event, video, roiCalculation],
}
