// Recurrence pattern types
export const FREQUENCY = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY'
};

// Generate instances for a recurring goal
export const generateInstances = (goal, startDate, endDate) => {
  if (!goal.repeat) {
    return [{
      date: goal.startDate,
      text: goal.text,
      time: goal.time,
      modified: false
    }];
  }

  const instances = [];
  const pattern = goal.repeat.pattern;
  let currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    if (isValidInstance(currentDate, pattern, goal.repeat.exclusions)) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const modification = goal.repeat.modifications[dateStr];
      
      instances.push({
        date: dateStr,
        text: modification?.text || goal.text,
        time: modification?.time || goal.time,
        modified: !!modification
      });
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return instances;
};

// Check if a date is valid for a recurrence pattern
export const isValidInstance = (date, pattern, exclusions) => {
  const dateStr = date.toISOString().split('T')[0];
  if (exclusions.includes(dateStr)) {
    return false;
  }

  const day = date.getDay();
  const monthDay = date.getDate();

  switch (pattern.frequency) {
    case FREQUENCY.DAILY:
      return true;
    case FREQUENCY.WEEKLY:
      if (pattern.byDay) {
        const dayStr = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][day];
        return pattern.byDay.includes(dayStr);
      }
      return true;
    case FREQUENCY.MONTHLY:
      if (pattern.byMonthDay) {
        return pattern.byMonthDay.includes(monthDay.toString());
      }
      return true;
    default:
      return true;
  }
};

// Modify a specific instance of a recurring goal
export const modifyInstance = (goal, date, modification) => {
  if (!goal.repeat) {
    return {
      ...goal,
      text: modification.text || goal.text,
      time: modification.time || goal.time
    };
  }

  return {
    ...goal,
    repeat: {
      ...goal.repeat,
      modifications: {
        ...goal.repeat.modifications,
        [date]: {
          ...goal.repeat.modifications[date],
          ...modification
        }
      }
    }
  };
};

// Exclude a specific instance of a recurring goal
export const excludeInstance = (goal, date) => {
  if (!goal.repeat) {
    return goal;
  }

  return {
    ...goal,
    repeat: {
      ...goal.repeat,
      exclusions: [...goal.repeat.exclusions, date]
    }
  };
};

// Create a recurrence pattern
export const createPattern = (type, options = {}) => {
  const basePattern = {
    frequency: type,
    interval: options.interval || 1
  };

  switch (type) {
    case FREQUENCY.WEEKLY:
      return {
        ...basePattern,
        byDay: options.days || []
      };
    case FREQUENCY.MONTHLY:
      return {
        ...basePattern,
        byMonthDay: options.days || []
      };
    default:
      return basePattern;
  }
}; 