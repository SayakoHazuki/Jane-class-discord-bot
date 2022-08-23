export enum DayOfCycle {
  A = "A",
  B = "B",
  C = "C",
  D = "D",
  E = "E",
  F = "F",
  G = "G",
  H = "H",
}

export enum LessonType {
  CTP,
  LESSON,
  RECESS,
  LUNCH,
  EXTRA_LESSON,
  EMPTY,
  SPECIAL,
}

export enum LessonTimeType {
  DEFAULT = "DFLT",
  NORMAL = "NORM",
  NORMAL_SUMMER_TIME = "SMMR",
}

export enum SchoolDayType {
  SCHOOL_DAY,
  HOLIDAY,
  SPECIAL_SCHOOL_DAY,
  UNSPECIFIED,
}

export enum Subjects {
  CHIN = "中國語文 (CHIN)",
  ENG = "英國語文 (ENG)",
  MATH = "數學 (MATH)",
  M1 = "數延單元1 (M1)",
  M2 = "數延單元2 (M2)",
  LIBS = "通識教育 (LIBS)",
  LS = "生活與社會 (L&S)", // L&S
  BIO = "生物 (SCI.A)",
  BAFS = "企業會計與財務概論 (BAFS)",
  CHEM = "化學 (SCI.B)",
  CHIS = "中國歷史 (CHIS)",
  CLIT = "中國文學 (CLIT)",
  DE = "戲劇 (DR)",
  ECON = "經濟 (ECON)",
  GEOG = "地理 (GEOG)",
  HIST = "歷史 (HIST)",
  HEC = "家政 (HEC)",
  IT = "資訊科技 (IT)",
  ICT = "資訊及通訊科技 (ICT)",
  MUS = "音樂 (MUS)",
  PE = "體育 (PE)",
  PHY = "物理 (SCI.C)",
  PTH = "普通話 (PTH)",
  RS = "宗教 (RS)",
  THS = "旅遊與款待 (THS)",
  VA = "視覺藝術 (VA)",
  ENG_SPEAKING = "英文說話 (SPEAK)",
  CTP = "班主任課 (CTP)",
  SCI = "綜合科學 (IS)",
  X1 = "1X",
  X2 = "2X",
  X3 = "3X",
  IA = "IA",
  ASS = "週會 (ASS)",
  CS = "公民與社會發展 (CS)",
}

export enum ErrorCode {
  GENERAL_DATABASE_ERR = 500,
  NULL_USER_DATA,

  UNEXPECTED_ERR = 900,
  UNEXPECTED_NULL_OR_FALSY = 910,
  UNEXPECTED_NULL,
  UNEXPECTED_FALSY,
  UNEXPECTED_TYPE = 920,
  UNEXPECTED_INPUT_FORMAT,
  UNEXPECTED_INPUT_VALUE,
  UNEXPECTED_NUMBER,

  HTTP_BAD_REQUSET = 1400,
  HTTP_NOT_FOUND = 1404,

  HTTP_UNEXPECTED_STATUS = 1999,
}

export enum CamelHgdActions {
  afternoonTea = "afternoonTea",
  gardening = "gardening",
  files = "files",
  morning = "morning",
  night = "night",
  pat = "pat",
  rose = "rose",
  roseTea = "roseTea",
  teeTee = "teeTee",
}

export enum PascalHgdActions {
  afternoonTea = "AfternoonTea",
  gardening = "Gardening",
  files = "Files",
  morning = "Morning",
  night = "Night",
  pat = "Pat",
  rose = "Rose",
  roseTea = "RoseTea",
  teeTee = "TeeTee",
}

export enum JaneInteractionType {
  BTN,
}

export enum JaneInteractionGroup {
  HGD,
  CMD,
}

export enum JaneHgdButtonActions {
  RUN,
}

export enum JaneHgdButtonRunCode {
  afternoonTea,
  gardening,
  files,
  morning,
  night,
  pat,
  rose,
  roseTea,
  teeTee,
}
