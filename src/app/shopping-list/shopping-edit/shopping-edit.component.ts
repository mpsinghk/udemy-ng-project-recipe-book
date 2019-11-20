import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';

import { Ingredient } from 'src/app/shared/ingredient.model';
import { ShoppingListService } from '../shopping-list.service';
import * as shoppingListActions from '../store/shopping-list.actions';

@Component({
    selector: 'app-shopping-edit',
    templateUrl: './shopping-edit.component.html',
    styleUrls: ['./shopping-edit.component.css']
})
export class ShoppingEditComponent implements OnInit, OnDestroy {
    @ViewChild('f', { static: false }) slForm: NgForm;
    editMode = false;
    editedItemIndex: number;
    editedItem: Ingredient;
    subscription: Subscription;

    constructor(
        private slService: ShoppingListService,
        private store: Store<{ shoppingList: { ingredients: Ingredient[] } }>
    ) {}

    ngOnInit() {
        this.subscription = this.slService.startedEditing.subscribe((index: number) => {
            this.editedItemIndex = index;
            this.editMode = true;
            this.editedItem = this.slService.getIngredient(index);
            this.slForm.setValue({
                name: this.editedItem.name,
                amount: this.editedItem.amount
            });
        });
    }

    onSubmit(form: NgForm) {
        const value = form.value;
        const newIngredient = new Ingredient(value.name, value.amount);
        if (this.editMode) {
            // this.slService.updateIngredient(this.editedItemIndex, newIngredient);
            this.store.dispatch(
                new shoppingListActions.UpdateIngredient({
                    index: this.editedItemIndex,
                    ingredient: newIngredient
                })
            );
        } else {
            // this.slService.addIngredient(newIngredient);
            this.store.dispatch(new shoppingListActions.AddIngredient(newIngredient));
        }
        this.editMode = false;
        form.reset();
    }

    onClear() {
        this.slForm.reset();
        this.editMode = false;
    }

    onDelete() {
        // this.slService.deleteIngredient(this.editedItemIndex);
        this.store.dispatch(
            new shoppingListActions.DeleteIngredient(this.editedItemIndex)
        );
        this.onClear();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
