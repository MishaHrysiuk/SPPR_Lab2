import './App.css';
import { useState, useEffect } from "react";
import { SpreadsheetComponent, SheetsDirective, SheetDirective, RangesDirective, RangeDirective } from '@syncfusion/ej2-react-spreadsheet/src';
import { Button, Card, Form }  from 'react-bootstrap';

function App() {
  const [applicantsList, setApplicantsList] = useState([]);
  const [rateApplicantsList, setRateApplicantsList] = useState([]);
  const [id, setId] = useState(0);
  const [idDelete, setIdDelete] = useState(0);
  const [name, setName] = useState("");
  const [math, setMath] = useState(0);
  const [ukr, setUkr] = useState(0);
  const [eng, setEng] = useState(0);
  const [beneficiary, setBeneficiary] = useState(false);
  const [update, setUpdate] = useState(false);

	useEffect(() => {
		request("http://localhost:3001/applicants", "GET")
			.then(res => {
				setApplicantsList(res)
				setRateApplicantsList(decisionMakingSystem(res))
			})
			.catch(err => console.log(err))
			
	}, [update])

  	const decisionMakingSystem = (students) => {
		let possibleStudentsBeneficiary = []
		let possibleStudents = []
		students.forEach(student => {
			if (student.beneficiary === true) {
				if (student.rate >= 144) {
					if (student.math >= 120 &&
						student.eng >= 120 &&
						student.ukr >= 120) {
						possibleStudentsBeneficiary.push(student)
					}
				}
			} else {
				if (student.rate >= 160) {
					if (student.math >= 140) {
						possibleStudents.push(student)
					}
				}
			}
		});

		possibleStudentsBeneficiary = possibleStudentsBeneficiary.sort(rateCompare).slice(0, 35)
		possibleStudents = possibleStudents.sort(rateCompare).slice(0, 350-possibleStudentsBeneficiary.length)
		return possibleStudentsBeneficiary.concat(possibleStudents)
	}

	const rateCompare = (a, b) => {
		if (a.rate < b.rate) {
			return 1
		}
		if (a.rate > b.rate) {
			return -1
		}
		return 0
	}
	
	const request = async (url, method = 'GET', body = null, headers = {'Content-Type': 'application/json'})  => {
		try {
			const response = await fetch(url, {method, body, headers});
			if (!response.ok) {
				throw new Error(`Could not fetch ${url}, status: ${response.status}`);
			}
			const data = await response.json();
			return data;
		} catch(e) {
			throw e;
		}
	};

  	const onValueChange = (e) => {
    switch(e.target.name) {
      case "id":
        setId(e.target.value)
        break;
      case "name":
        setName(e.target.value)
        break;
      case "math":
        setMath(e.target.value)
        break;
      case "ukr":
        setUkr(e.target.value)
        break;
      case "eng":
        setEng(e.target.value)
        break;
      case "beneficiary":
        setBeneficiary((prevBeneficiary) => !prevBeneficiary)
        break;
      case "idDelete":
        setIdDelete(e.target.value)
        break;
    }
}

	const addApplicant = (id, name, math, ukr, eng, beneficiary) => {
	const applicant = {
		id: +id,
		name,
		math: +math,
		ukr: +ukr,
		eng: +eng,
		beneficiary,
		rate: 0.4*math+0.3*ukr+0.3*eng
	}
	request("http://localhost:3001/applicants", "POST", JSON.stringify(applicant))
		.then(res => alert(`Applicant id:${res.id} ${res.name} added!`))
		.catch(err => console.log(err))
		
		setId("")
		setName("")
		setMath("")
		setUkr("")
		setEng("")
		setUpdate((prev) => !prev)
	}

	const deleteApplicant = (id) => {
	request(`http://localhost:3001/applicants/${id}`, "DELETE")
		.then(res => alert(`Applicant №${id} deleted!`))
		.catch(err => console.log(err))
	setIdDelete("")
	setUpdate((prev) => !prev)

	}
    

  return (
    <div className='app'>
		<Card className="card">
          <Card.Title>Усі абітурієнти</Card.Title>
			<SpreadsheetComponent>
			<SheetsDirective>
			<SheetDirective>
				<RangesDirective>
				<RangeDirective dataSource={applicantsList}></RangeDirective>
				</RangesDirective>
			</SheetDirective >
			</SheetsDirective>
		</SpreadsheetComponent>
		</Card>
	
		<Card className="card">
          <Card.Title>Рейтинг абітурієнтів які можуть поступити</Card.Title>
			<SpreadsheetComponent allowOpen={true}
			openUrl="https://ej2services.syncfusion.com/production/web-services/api/spreadsheet/open"
			allowSave={true}
			saveUrl="https://ej2services.syncfusion.com/production/web-services/api/spreadsheet/save">
			<SheetsDirective>
			<SheetDirective>
				<RangesDirective>
				<RangeDirective dataSource={rateApplicantsList}></RangeDirective>
				</RangesDirective>
			</SheetDirective >
			</SheetsDirective>
		</SpreadsheetComponent>
		</Card>
      
        <Card className="card">
          <Card.Title>Додати абітурієнта</Card.Title>
          <Form onSubmit={(e) => {e.preventDefault(); addApplicant(id, name, math, ukr, eng, beneficiary)}}>
            <Form.Group className="mb-3">
              <Form.Label>ID</Form.Label>
              <Form.Control 
                type="number" 
                placeholder="Enter id" 
                onChange={onValueChange}
                name="id"
                value={id}/>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Імя та прізвище</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Введіть імя та прізвище" 
                onChange={onValueChange}
                name="name"
                value={name}/>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Бал з математики</Form.Label>
              <Form.Control 
                type="number" 
                placeholder="Введіть оцінку" 
                onChange={onValueChange}
                name="math"
                value={math}/>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Бал з української мови</Form.Label>
              <Form.Control 
                type="number" 
                placeholder="Введіть оцінку" 
                onChange={onValueChange}
                name="ukr"
                value={ukr}/>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Бал з англійської мови</Form.Label>
              <Form.Control 
                type="number" 
                placeholder="Введіть оцінку" 
                onChange={onValueChange}
                name="eng"
                value={eng}/>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox" 
                label="Пільговик" 
                onChange={onValueChange}
                name="beneficiary"/>
            </Form.Group>
            <Button variant="primary" type="submit">
              Добавити
            </Button>
          </Form>
        </Card>
        <Card className="card">
          <Card.Title>Видалити абітурієнта</Card.Title>
          <Form onSubmit={(e) => {e.preventDefault(); deleteApplicant(idDelete)}}>
            <Form.Group className="mb-3">
              <Form.Label>ID</Form.Label>
              <Form.Control 
                type="number" 
                placeholder="Enter id" 
                onChange={onValueChange}
                name="idDelete"
                value={idDelete}/>
            </Form.Group>
            <Button variant="danger" type="submit">
              Видалити
            </Button>
          </Form>
        </Card>
    </div>
  );
}

export default App;
