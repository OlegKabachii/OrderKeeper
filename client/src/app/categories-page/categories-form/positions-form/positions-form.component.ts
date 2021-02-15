import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PositionService} from "../../../shared/services/position.service";
import {Position} from "../../../shared/services/interfaces";
import {MaterialInstance, MaterialService} from "../../../shared/clases/material.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-positions-form',
  templateUrl: './positions-form.component.html',
  styleUrls: ['./positions-form.component.scss']
})
export class PositionsFormComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input('categoryId') categoryId: string
  @ViewChild('modal') modalRef: ElementRef
  positions: Position[] = []
  loading = false
  modal: MaterialInstance
  form: FormGroup
  positionId = null

  constructor(private positionService: PositionService) {
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl(null, Validators.required),
      cost: new FormControl(null, [Validators.required, Validators.min(1)])
    })

    this.loading = true
    this.positionService.fetch(this.categoryId).subscribe(positions => {
      this.positions = positions
      this.loading = false
    })
  }

  ngAfterViewInit(): void {
    this.modal = MaterialService.initModal(this.modalRef)
  }

  ngOnDestroy(): void {
    this.modal.destroy()
  }

  onSelectPosition(position: Position) {
    this.positionId = position._id
    this.form.patchValue({
      name: position.name,
      cost: position.cost
    })
    this.modal.open()
    MaterialService.updateTextInput()
  }

  onAddPosition() {
    this.positionId = null
    this.form.reset({
      name: null,
      cost: null
    })
    this.modal.open()
    MaterialService.updateTextInput()
  }

  onCancel() {
    this.modal.close()
  }

  onSubmit() {
    this.form.disable()
    const newPosition: Position = {
      name: this.form.value.name,
      cost: this.form.value.cost,
      category: this.categoryId
    }

    const completed = () => {
      this.modal.close()
      this.form.reset({name: '', cost: null})
      this.form.enable()
    }

    if (this.positionId) {
      newPosition._id = this.positionId
      this.positionService.update(newPosition)
        .subscribe(
          position => {
            const idx = this.positions.findIndex(p => p._id === position._id)
           this.positions[idx] = position
            MaterialService.toast('Changed save')
          },
          error => {
            this.form.enable()
            MaterialService.toast(error.error.message)
          },
          completed
        )
    } else {
      this.positionService.create(newPosition).subscribe(
        position => {
          MaterialService.toast('Position created')
          this.positions.push(position)
        },
        error => {
          this.form.enable()
          MaterialService.toast(error.error.message)
        },
        completed
      )
    }
  }

  onDeletePosition($event, position: Position) {
    event.stopPropagation()
    const decision = window.confirm(`Delete position "${position.name}"?`)
  if (decision){
    this.positionService.delete(position).subscribe(
      response =>{
        const idx = this.positions.findIndex(p=> p._id === position._id)
        this.positions.splice(idx,1)
        MaterialService.toast(response.message)
      },
      error => MaterialService.toast(error.error.message)
    )
  }
  }
}
