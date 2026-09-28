const workoutData =[
    //cardio
    {
        id: 'running',
        name: "Running",
        category:"Cardio",
        caloriesPerMinuteBase:'10',
        description: 'Jogging or Running',
        intensityLevels:{
            light:0.8,
            moderate:1.0,
            intense:1.2,
            veryIntense:1.5
        },
        trackDistance:true
    },
{
        id: 'walking',
        name: "Walking",
        category:"Cardio",
        caloriesPerMinuteBase:'5',
        description: 'Casual or brisk walking',
        intensityLevels:{
            light:0.9,
            moderate:1.0,
            intense:1.1,
            veryIntense:1.5
        },
        trackDistance:true
    },
    {
    id: "hiit",
    name: "HIIT",
    category: "Cardio",
    description: "High-Intensity Interval Training.",
    caloriesPerMinuteBase: 12,
    intensityLevels: {
      light: 0.9,
      moderate: 1.0,
      intense: 1.3,
    },
    trackDistance: false
  },
  {
    id: "skipping",
    name: "Skipping",
    category: "Cardio",
    description: "Jump rope for endurance or speed.",
    caloriesPerMinuteBase: 11,
    intensityLevels: {
      light: 0.8,
      moderate: 1.0,
      intense: 1.2,
    },
    trackDistance: false
  },

  //Resistance training
   {
    id: "weightlifting",
    name: "Weightlifting",
    category: "Resistance",
    description: "Free weights or machines.",
    caloriesPerMinuteBase: 6,
    intensityLevels: {
      light: 0.9,
      moderate: 1.0,
      intense: 1.1,
    },
    trackDistance: false
  },
  {
    id: "calisthenics",
    name: "Calisthenics",
    category: "Resistance",
    description: "Bodyweight movements like push-ups, squats.",
    caloriesPerMinuteBase: 7,
    intensityLevels: {
      light: 0.9,
      moderate: 1.0,
      intense: 1.15,
    },
    trackDistance: false
  },

  //Fun 
  {
    id: "football",
    name: "Football",
    category: "Fun",
    description: "Casual or competitive football/soccer.",
    caloriesPerMinuteBase: 8,
    intensityLevels: {
      light: 0.8,
      moderate: 1.0,
      intense: 1.2,
    },
    trackDistance: false
  },
  {
    id: "basketball",
    name: "Basketball",
    category: "Fun",
    description: "Casual shooting or competitive play.",
    caloriesPerMinuteBase: 9,
    intensityLevels: {
      light: 0.9,
      moderate: 1.0,
      intense: 1.2,
    },
    trackDistance: false
  },
  {
    id: "dancing",
    name: "Dancing",
    category: "Fun",
    description: "Zumba, freestyle, or choreographed routines.",
    caloriesPerMinuteBase: 7,
    intensityLevels: {
      light: 0.85,
      moderate: 1.0,
      intense: 1.15,
    },
    trackDistance: false
  }
];

export default workoutData;