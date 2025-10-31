import { db } from '../index';
import { events } from '../schema';
import { eq, desc } from 'drizzle-orm';
import { generateIcs } from '../../../../apps/web/src/lib/ics'
