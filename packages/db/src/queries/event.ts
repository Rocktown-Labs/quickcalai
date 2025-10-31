import { db } from '../index';
import { events } from '../schema';
import { eq, desc } from 'drizzle-orm';
import { generateICS } from '../ics';
