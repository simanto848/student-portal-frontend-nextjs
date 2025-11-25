import { facultyService } from './academic/faculty.service';
import { departmentService } from './academic/department.service';
import { programService } from './academic/program.service';
import { sessionService } from './academic/session.service';
import { courseService } from './academic/course.service';
import { batchService } from './academic/batch.service';
import { sessionCourseService } from './academic/session-course.service';
import { classroomService } from './academic/classroom.service';
import { scheduleService } from './academic/schedule.service';
import { syllabusService } from './academic/syllabus.service';
import { examCommitteeService } from './academic/exam-committee.service';
import { prerequisiteService } from './academic/prerequisite.service';

export * from './academic';

export const academicService = {
    ...facultyService,
    ...departmentService,
    ...programService,
    ...sessionService,
    ...courseService,
    ...batchService,
    ...sessionCourseService,
    ...classroomService,
    ...scheduleService,
    ...syllabusService,
    ...examCommitteeService,
    ...prerequisiteService,
};
