import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Store } from '@ngrx/store';

// import { RecipeService } from '../recipe.service';
import * as fromApp from '../../store/app.reducer';
import * as RecipesActions from '../store/recipe.actions';

@Component({
    selector: 'app-recipe-edit',
    templateUrl: './recipe-edit.component.html',
    styleUrls: ['./recipe-edit.component.css']
})
export class RecipeEditComponent implements OnInit, OnDestroy {
    id: number;
    editMode = false;
    recipeForm: FormGroup;
    private storeSub: Subscription;

    constructor(
        private route: ActivatedRoute,
        // private recipeService: RecipeService,
        private router: Router,
        private store: Store<fromApp.AppState>
    ) {}

    ngOnInit() {
        this.route.params.subscribe((params: Params) => {
            this.id = +params['id'];
            this.editMode = params['id'] != null;
            this.initForm();
        });
    }

    ngOnDestroy() {
        if (this.storeSub) {
            this.storeSub.unsubscribe();
        }
    }

    onSubmit() {
        if (this.editMode) {
            // this.recipeService.updateRecipe(this.id, this.recipeForm.value);
            this.store.dispatch(
                new RecipesActions.UpdateRecipe({
                    index: this.id,
                    newRecipe: this.recipeForm.value
                })
            );
        } else {
            // this.recipeService.addRecipe(this.recipeForm.value);
            this.store.dispatch(new RecipesActions.AddRecipe(this.recipeForm.value));
        }
        this.onCancel();
    }

    onCancel() {
        this.router.navigate(['../'], { relativeTo: this.route });
    }

    onAddIngredient() {
        (this.recipeForm.get('ingredients') as FormArray).push(
            new FormGroup({
                name: new FormControl(null, Validators.required),
                amount: new FormControl(null, [
                    Validators.required,
                    Validators.pattern(/^[1-9]+[0-9]*$/)
                ])
            })
        );
    }

    onDeleteIngredient(index: number) {
        (this.recipeForm.get('ingredients') as FormArray).removeAt(index);
    }

    private initForm() {
        let recipeName = '';
        let recipeImagePath = '';
        let recipeDescription = '';
        // tslint:disable-next-line: prefer-const
        let recipeIngredients = new FormArray([]);

        if (this.editMode) {
            // const recipe = this.recipeService.getReceipe(this.id);
            this.storeSub = this.store
                .select('recipes')
                .pipe(
                    map(recipesState => {
                        return recipesState.recipes.find((recipe, index) => {
                            return index === this.id;
                        });
                    })
                )
                .subscribe(recipe => {
                    recipeName = recipe.name;
                    recipeImagePath = recipe.imagePath;
                    recipeDescription = recipe.description;
                    if (recipe['ingredients']) {
                        // tslint:disable-next-line: prefer-const
                        for (let ingredient of recipe.ingredients) {
                            recipeIngredients.push(
                                new FormGroup({
                                    name: new FormControl(
                                        ingredient.name,
                                        Validators.required
                                    ),
                                    amount: new FormControl(ingredient.amount, [
                                        Validators.required,
                                        Validators.pattern(/^[1-9]+[0-9]*$/)
                                    ])
                                })
                            );
                        }
                    }
                });
        }

        this.recipeForm = new FormGroup({
            name: new FormControl(recipeName, Validators.required),
            imagePath: new FormControl(recipeImagePath, Validators.required),
            description: new FormControl(recipeDescription, Validators.required),
            ingredients: recipeIngredients
        });
    }

    get controls() {
        return (this.recipeForm.get('ingredients') as FormArray).controls;
    }
}
