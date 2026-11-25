export const blueprints = [
  {
    id:'futurepath', projectId:'futurepath', title:'FuturePath AI',
    label:'DECISION INTELLIGENCE', accent:'#e5a7c2',
    steps:['Decision context','Guided interview','Scenario generation','Compare possible paths'],
    outputs:['BEST CASE','LIKELY CASE','WORST CASE'],
    note:'Scenarios describe possibilities, not predictions.',
  },
  {
    id:'visionguard', projectId:'vision-guard', title:'VisionGuard',
    label:'COMPUTER VISION', accent:'#9bcbbc',
    steps:['Image input','YOLO detections','Associate people & PPE','Assess the safety state'],
    outputs:['SAFE','VIOLATION','UNCERTAIN'],
    note:'Ambiguity needs an explicit uncertain state.',
  },
];
