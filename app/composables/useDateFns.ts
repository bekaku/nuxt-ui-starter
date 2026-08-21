
import { th, enUS } from 'date-fns/locale';
import { FORMAT_DATE_DD_MM_YY } from '~/utils/dateUtil';
export const useDateFns = () => {
  const { $datefns } = useNuxtApp()
  const { locale } = useLang();
  /**
   *
   * @param dateLeft the later date
   * @param dateRight the earlier date
   * @returns
   */
  const getDateDiffMinutes = (
    dateLeft: Date | number,
    dateRight: Date | number
  ) => {
    return $datefns.differenceInMinutes(dateRight, dateLeft);
  };

  const getDateDiff = (dateLeft: Date | number, dateRight: Date | number) => {
    return $datefns.differenceInDays(dateRight, dateLeft);
  };
  const getDateDiffNow = (dateString: string) => {
    const d = removeTime(dateString);
    const currentDate = removeTime(getCurrentDateByFormat());
    if (d == undefined || currentDate == undefined) {
      return 0;
    }
    // return getDateDiff(Date.parse(d), new Date());
    return getDateDiff(Date.parse(d), Date.parse(currentDate));
  };
  const getDateAutoFormatBy = (dateString: string | undefined) => {
    if (!dateString) {
      return '';
    }

    const difDays = getDateDiffNow(dateString);
    if (difDays > 0 && difDays < 365) {
      return formatDateTime(dateString, FORMAT_DATE_DD_MM);
    } else if (difDays > 365) {
      return formatDateTime(dateString, FORMAT_DATE_DD_MM_YY);
    }
    return formatDateTime(dateString, FORMAT_DATE_HH_MM);
  };
  const getDateTimeAutoFormatBy = (dateString: string | undefined) => {
    if (!dateString) {
      return '';
    }
    const difDays = getDateDiffNow(dateString);
    if (difDays >= 0 && difDays < 1) {
      return formatDateTime(dateString, FORMAT_DATE_HH_MM);
    } else if (difDays >= 1 && difDays < 365) {
      return formatDateTime(dateString, FORMAT_DATE_DD_MM_HH_MM);
    } else {
      return formatDateTime(dateString, FORMAT_DATE_TIME_ALT);
    }
  };
  const getDateDistanceAutoFormatBy = (dateString: string | undefined) => {
    if (!dateString) {
      return '';
    }
    const difDays = getDateDiffNow(dateString);
    if (difDays >= 0 && difDays < 1) {
      return formatDistanceFromNow({
                dateString: dateString,
                suffix: false,
                ios: false
              });
    } else if (difDays >= 1 && difDays < 365) {
      return formatDateTime(dateString, FORMAT_DATE_DD_MM_HH_MM);
    } else {
      return formatDateTime(dateString, FORMAT_DATE_TIME_ALT);
    }
  };
  /**
   * formatRelativeFromNow('2022-05-25 17:26:31', locale.value)
   * @param dateString
   * @returns
   */
  const formatRelativeFromNow = (
    dateString: string | undefined,
  ) => {
    if (!dateString) {
      return;
    }
    return $datefns.formatRelative(Date.parse(dateString), new Date(), {
      locale: locale.value == 'th' ? th : enUS
    });
  };
  /**
   * formatDistanceFromNow('2022-05-25 17:26:31', locale.value)
   * @param dateString
   * @param suffix
   * @returns
   */
  const formatDistanceFromNow = (options: {
    dateString: string,
    suffix?: boolean ,
    ios?: boolean,
    format?: string,
  }) => {
    return $datefns.formatDistanceToNow(
      convertStringToDate(options.dateString, options.format || 'yyyy-MM-dd HH:mm:ss', options.ios||false),
      {
        locale: locale.value == 'th' ? th : enUS,
        addSuffix: options.suffix || false
      });
  };
  const getCurrentDateByFormat = (
    forMatString: string | undefined = FORMAT_DATE_YYYY_MM_DD//yyyy-MM-dd
  ) => {
    return formatDateBy(getDateNow(), forMatString);
  };

  /**
   * formatDate('2022-05-25 17:26:31', 'dd MMMM yyyy', locale.value)
   * @param dateString
   * @param forMatString
   * @returns
   */
  const formatDateTime = (
    dateString: string | undefined | null,
    forMatString: string,
  ) => {
    if (!dateString) {
      return '';
    }
    return $datefns.format(convertStringToDate(dateString), forMatString, {
      locale: locale.value == 'th' ? th : enUS
    });
  };
  const formatDate = (
    dateString: string | undefined | null,
    forMatString: string,
  ) => {
    if (!dateString) {
      return undefined;
    }
    const d = removeTime(dateString);
    return d
      ? $datefns.format(convertStringToDate(d, FORMAT_DATE_YYYY_MM_DD), forMatString, {
        locale: locale.value == 'th' ? th : enUS
      })
      : undefined;
  };
  const formatDateBy = (d: Date, forMatString: string) => {
    return $datefns.format(d, forMatString);
  };
  const formatDistanceFrom = (
    dateString: string,
    fromDateString: string | undefined,
  ) => {
    return $datefns.formatDistance(
      convertStringToDate(dateString),
      fromDateString ? convertStringToDate(fromDateString) : new Date(),
      {
        locale: locale.value == 'th' ? th : enUS,
        addSuffix: true
      }
    );
  };
  const formatIos = (d: string, forMatString: string) => {
    return $datefns.format($datefns.parseISO(d), forMatString);
  };
  const parseISO = (
    dateString: string,
  ): Date => {
    return $datefns.parseISO(dateString);
  };
  const convertStringToDate = (
    dateString: string,
    format = 'yyyy-MM-dd HH:mm:ss',
    ios: boolean = false,
  ): Date => {
    if (ios) {
      return $datefns.parseISO(dateString);
    }
    return $datefns.parse(dateString, format, new Date());
    // return new Date(dateString);
  };
  const isDateEqua = (dateLeft: string, dateRight: string) => {
    const d1 = convertStringToDate(dateLeft, FORMAT_DATE_YYYY_MM_DD);
    const d2 = convertStringToDate(dateRight, FORMAT_DATE_YYYY_MM_DD);
    return $datefns.isEqual(d1, d2);
  };
  const isDateAfter = (dateLeft: string, dateRight: string) => {
    const d1 = convertStringToDate(dateLeft, FORMAT_DATE_YYYY_MM_DD);
    const d2 = convertStringToDate(dateRight, FORMAT_DATE_YYYY_MM_DD);
    return $datefns.isAfter(d1, d2);
  };
  const isDateBefore = (dateLeft: string, dateRight: string) => {
    const d1 = convertStringToDate(dateLeft, FORMAT_DATE_YYYY_MM_DD);
    const d2 = convertStringToDate(dateRight, FORMAT_DATE_YYYY_MM_DD);
    return $datefns.isBefore(d1, d2);
  };
  return {
    getCurrentDateByFormat,
    getDateDiffMinutes,
    formatDistanceFromNow,
    formatDate,
    formatDateTime,
    getDateTimeAutoFormatBy,
    parseISO
  };
};
